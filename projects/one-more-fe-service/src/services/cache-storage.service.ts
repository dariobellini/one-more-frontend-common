import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export type CacheType = 'json' | 'text' | 'binary';

export interface CacheOptions {
  category?: string;     // default: 'default'
  ttlMs?: number;        // default: 7 giorni, 0 = no scadenza
  type?: CacheType;      // default: 'json'
  mimeType?: string;     // utile per binary
  forceFile?: boolean;   // forza Filesystem anche se piccolo
}

type StorageKind = 'preferences' | 'file';

interface CacheEntry {
  id: string;            // category::key
  key: string;
  category: string;
  type: CacheType;

  storage: StorageKind;
  prefKey?: string;      // se preferences
  filePath?: string;     // se file (relativo a CACHE_DIR)

  size: number;          // bytes
  mimeType?: string;

  createdAt: number;
  updatedAt: number;
  lastAccessAt: number;

  ttlMs: number;         // 0 = mai
}

interface CacheIndexV1 {
  v: 1;
  entries: Record<string, CacheEntry>;
}

export interface CacheStats {
  totalEntries: number;
  totalSizeMB: number;
  byCategory: Record<string, { count: number; sizeMB: number }>;
  byStorage: Record<StorageKind, { count: number; sizeMB: number }>;
}

class Mutex {
  private lock: Promise<void> = Promise.resolve();

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const prev = this.lock;
    let release!: () => void;
    this.lock = new Promise<void>(r => (release = r));
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }
}

@Injectable({ providedIn: 'root' })
export class CacheServiceV2 {
  private readonly CACHE_DIR = 'app-cache';
  private readonly INDEX_KEY = 'cache:index:v1';

  private readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 giorni
  private readonly MAX_CACHE_MB = 100;
  private readonly EVICT_TO_RATIO = 0.8; // quando sfora, libera fino a 80%
  private readonly PREFERENCES_MAX_BYTES = 50 * 1024; // soglia: 50KB (tuning)

  private readonly mutex = new Mutex();

  constructor() {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.mutex.run(async () => {
      await this.cleanupExpired();
      await this.enforceSizeLimit();
    });
  }

  // -------------------- PUBLIC API --------------------

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const category = options.category ?? 'default';
    const type: CacheType = options.type ?? 'json';
    const ttlMs = options.ttlMs ?? this.DEFAULT_TTL;

    await this.mutex.run(async () => {
      const index = await this.loadIndex();

      // Se esiste già, rimuoviamo prima (così non lasciamo file/preference orfani)
      const existing = index.entries[this.makeId(category, key)];
      if (existing) {
        await this.deleteEntryPhysical(existing);
        delete index.entries[existing.id];
      }

      const { dataBytes, prefValue, fileBase64, encoding, size, mimeType } =
        await this.serialize(value, type, options.mimeType);

      const entry: CacheEntry = {
        id: this.makeId(category, key),
        key,
        category,
        type,
        storage: 'preferences', // deciso sotto
        size,
        mimeType: mimeType ?? options.mimeType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastAccessAt: Date.now(),
        ttlMs: ttlMs ?? this.DEFAULT_TTL,
      };

      const shouldUseFile =
        options.forceFile === true ||
        size > this.PREFERENCES_MAX_BYTES ||
        type === 'binary'; // di default binary su file

      if (!shouldUseFile) {
        entry.storage = 'preferences';
        entry.prefKey = this.prefKey(entry);
        await Preferences.set({ key: entry.prefKey, value: prefValue! });
      } else {
        entry.storage = 'file';
        entry.filePath = this.filePath(entry, type);
        await Filesystem.writeFile({
          path: `${this.CACHE_DIR}/${entry.filePath}`,
          directory: Directory.Cache,
          recursive: true,
          data: fileBase64!,
        });
        // Nota: Filesystem scrive base64, quindi size reale è size (calcolata prima)
        // encoding serve solo in lettura per text/json
      }

      index.entries[entry.id] = entry;
      await this.saveIndex(index);

      await this.enforceSizeLimit(); // eviction LRU semplice
    });
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const category = options.category ?? 'default';

    return this.mutex.run(async () => {
      const index = await this.loadIndex();
      const id = this.makeId(category, key);
      const entry = index.entries[id];
      if (!entry) return null;

      if (this.isExpired(entry)) {
        await this.deleteEntryPhysical(entry);
        delete index.entries[id];
        await this.saveIndex(index);
        return null;
      }

      const value = await this.readEntryValue<T>(entry);

      // aggiorna last access (LRU)
      entry.lastAccessAt = Date.now();
      index.entries[id] = entry;
      await this.saveIndex(index);

      return value;
    });
  }

  async has(key: string, options: CacheOptions = {}): Promise<boolean> {
    const category = options.category ?? 'default';
    return this.mutex.run(async () => {
      const index = await this.loadIndex();
      const entry = index.entries[this.makeId(category, key)];
      if (!entry) return false;
      if (this.isExpired(entry)) return false;
      return true;
    });
  }

  async remove(key: string, options: CacheOptions = {}): Promise<void> {
    const category = options.category ?? 'default';

    await this.mutex.run(async () => {
      const index = await this.loadIndex();
      const id = this.makeId(category, key);
      const entry = index.entries[id];
      if (!entry) return;

      await this.deleteEntryPhysical(entry);
      delete index.entries[id];
      await this.saveIndex(index);
    });
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) return cached;

    const fresh = await fetchFn();
    await this.set(key, fresh, { ...options, type: options.type ?? 'json' });
    return fresh;
  }

  async clearAll(): Promise<void> {
    await this.mutex.run(async () => {
      const index = await this.loadIndex();
      const entries = Object.values(index.entries);

      for (const e of entries) {
        await this.deleteEntryPhysical(e);
      }

      // elimina cartella (best effort)
      try {
        await Filesystem.rmdir({
          path: this.CACHE_DIR,
          directory: Directory.Cache,
          recursive: true,
        });
      } catch {
        // ignore
      }

      await this.saveIndex({ v: 1, entries: {} });
    });
  }

  async clearCategory(category: string): Promise<void> {
    await this.mutex.run(async () => {
      const index = await this.loadIndex();

      for (const [id, entry] of Object.entries(index.entries)) {
        if (entry.category === category) {
          await this.deleteEntryPhysical(entry);
          delete index.entries[id];
        }
      }

      await this.saveIndex(index);
    });
  }

  async stats(): Promise<CacheStats> {
    return this.mutex.run(async () => {
      const index = await this.loadIndex();
      const entries = Object.values(index.entries);

      const stats: CacheStats = {
        totalEntries: entries.length,
        totalSizeMB: 0,
        byCategory: {},
        byStorage: {
          preferences: { count: 0, sizeMB: 0 },
          file: { count: 0, sizeMB: 0 },
        },
      };

      for (const e of entries) {
        const mb = e.size / (1024 * 1024);
        stats.totalSizeMB += mb;

        stats.byStorage[e.storage].count += 1;
        stats.byStorage[e.storage].sizeMB += mb;

        if (!stats.byCategory[e.category]) {
          stats.byCategory[e.category] = { count: 0, sizeMB: 0 };
        }
        stats.byCategory[e.category].count += 1;
        stats.byCategory[e.category].sizeMB += mb;
      }

      return stats;
    });
  }

  // -------------------- INTERNALS --------------------

  private async cleanupExpired(): Promise<void> {
    const index = await this.loadIndex();
    let changed = false;

    for (const [id, entry] of Object.entries(index.entries)) {
      if (this.isExpired(entry)) {
        await this.deleteEntryPhysical(entry);
        delete index.entries[id];
        changed = true;
      }
    }

    if (changed) await this.saveIndex(index);
  }

  private async enforceSizeLimit(): Promise<void> {
    const index = await this.loadIndex();
    const entries = Object.values(index.entries);

    const totalBytes = entries.reduce((s, e) => s + e.size, 0);
    const maxBytes = this.MAX_CACHE_MB * 1024 * 1024;
    if (totalBytes <= maxBytes) return;

    const targetBytes = Math.floor(maxBytes * this.EVICT_TO_RATIO);

    // LRU: più vecchio lastAccessAt fuori per primo
    const sorted = [...entries].sort((a, b) => a.lastAccessAt - b.lastAccessAt);

    let current = totalBytes;
    for (const e of sorted) {
      if (current <= targetBytes) break;
      await this.deleteEntryPhysical(e);
      delete index.entries[e.id];
      current -= e.size;
    }

    await this.saveIndex(index);
  }

  private async readEntryValue<T>(entry: CacheEntry): Promise<T> {
    if (entry.storage === 'preferences') {
      const { value } = await Preferences.get({ key: entry.prefKey! });
      if (!value) throw new Error(`Cache value missing in preferences: ${entry.id}`);

      if (entry.type === 'json') return JSON.parse(value) as T;
      if (entry.type === 'text') return value as unknown as T;

      // binary su preferences non dovrebbe succedere, ma gestiamolo:
      return this.base64ToArrayBuffer(value) as unknown as T;
    }

    // file
    const fullPath = `${this.CACHE_DIR}/${entry.filePath!}`;
    const res = await Filesystem.readFile({
      path: fullPath,
      directory: Directory.Cache,
    });

    if (entry.type === 'json') {
      const text = this.base64ToUtf8(res.data as string);
      return JSON.parse(text) as T;
    }

    if (entry.type === 'text') {
      return this.base64ToUtf8(res.data as string) as unknown as T;
    }

    // binary
    return this.base64ToArrayBuffer(res.data as string) as unknown as T;
  }

  private async deleteEntryPhysical(entry: CacheEntry): Promise<void> {
    try {
      if (entry.storage === 'preferences') {
        if (entry.prefKey) await Preferences.remove({ key: entry.prefKey });
        return;
      }

      if (entry.storage === 'file' && entry.filePath) {
        await Filesystem.deleteFile({
          path: `${this.CACHE_DIR}/${entry.filePath}`,
          directory: Directory.Cache,
        });
      }
    } catch {
      // best-effort: se è già sparito non ci interessa
    }
  }

  private async loadIndex(): Promise<CacheIndexV1> {
    try {
      const { value } = await Preferences.get({ key: this.INDEX_KEY });
      if (!value) return { v: 1, entries: {} };

      const parsed = JSON.parse(value);
      if (!parsed || parsed.v !== 1 || typeof parsed.entries !== 'object') {
        // index corrotto → reset
        return { v: 1, entries: {} };
      }
      return parsed as CacheIndexV1;
    } catch {
      return { v: 1, entries: {} };
    }
  }

  private async saveIndex(index: CacheIndexV1): Promise<void> {
    await Preferences.set({
      key: this.INDEX_KEY,
      value: JSON.stringify(index),
    });
  }

  private isExpired(entry: CacheEntry): boolean {
    if (entry.ttlMs === 0) return false;
    return Date.now() - entry.updatedAt > entry.ttlMs;
  }

  private makeId(category: string, key: string): string {
    return `${category}::${key}`;
  }

  private prefKey(entry: CacheEntry): string {
    // chiave stabile
    return `cache:v2:${entry.category}:${this.hash(entry.key)}`;
  }

  private filePath(entry: CacheEntry, type: CacheType): string {
    const ext = type === 'json' ? 'json' : type === 'text' ? 'txt' : 'bin';
    return `${entry.category}/${this.hash(entry.key)}.${ext}`;
  }

  // -------------------- SERIALIZATION --------------------

  private async serialize(
    value: any,
    type: CacheType,
    mimeType?: string
  ): Promise<{
    dataBytes: Uint8Array;
    prefValue?: string;
    fileBase64?: string;
    encoding?: Encoding;
    size: number;
    mimeType?: string;
  }> {
    if (type === 'json') {
      const text = JSON.stringify(value);
      const bytes = new TextEncoder().encode(text);
      const base64 = this.utf8ToBase64(text);
      return { dataBytes: bytes, prefValue: text, fileBase64: base64, encoding: Encoding.UTF8, size: bytes.length, mimeType: 'application/json' };
    }

    if (type === 'text') {
      const text = String(value ?? '');
      const bytes = new TextEncoder().encode(text);
      const base64 = this.utf8ToBase64(text);
      return { dataBytes: bytes, prefValue: text, fileBase64: base64, encoding: Encoding.UTF8, size: bytes.length, mimeType: 'text/plain' };
    }

    // binary: accetta ArrayBuffer | Uint8Array | Blob | base64-string
    if (value instanceof Blob) {
      const ab = await value.arrayBuffer();
      const bytes = new Uint8Array(ab);
      const base64 = this.arrayBufferToBase64(ab);
      return { dataBytes: bytes, fileBase64: base64, size: bytes.length, mimeType: mimeType ?? value.type ?? 'application/octet-stream' };
    }

    if (value instanceof ArrayBuffer) {
      const bytes = new Uint8Array(value);
      const base64 = this.arrayBufferToBase64(value);
      return { dataBytes: bytes, fileBase64: base64, size: bytes.length, mimeType: mimeType ?? 'application/octet-stream' };
    }

    if (value instanceof Uint8Array) {
      const base64 = this.uint8ToBase64(value);
      return { dataBytes: value, fileBase64: base64, size: value.byteLength, mimeType: mimeType ?? 'application/octet-stream' };
    }

    if (typeof value === 'string') {
      // assumiamo base64 “puro” per binary
      const bytes = this.base64ToUint8(value);
      return { dataBytes: bytes, prefValue: value, fileBase64: value, size: bytes.length, mimeType: mimeType ?? 'application/octet-stream' };
    }

    throw new Error('Unsupported binary value type');
  }

  // -------------------- HELPERS --------------------

  private hash(str: string): string {
    // hash semplice ma stabile
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  private utf8ToBase64(text: string): string {
    const bytes = new TextEncoder().encode(text);
    return this.uint8ToBase64(bytes);
  }

  private base64ToUtf8(b64: string): string {
    const bytes = this.base64ToUint8(b64);
    return new TextDecoder().decode(bytes);
  }

  private uint8ToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  private base64ToUint8(b64: string): Uint8Array {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  private arrayBufferToBase64(ab: ArrayBuffer): string {
    return this.uint8ToBase64(new Uint8Array(ab));
  }

  private base64ToArrayBuffer(b64: string): ArrayBufferLike {
    return this.base64ToUint8(b64).buffer;
  }

  // Se ti serve una URI per mostrare un’immagine su native:
  async getFileUri(key: string, options: CacheOptions = {}): Promise<string | null> {
    const category = options.category ?? 'default';
    const entry = await this.mutex.run(async () => {
      const index = await this.loadIndex();
      return index.entries[this.makeId(category, key)] ?? null;
    });

    if (!entry || entry.storage !== 'file' || !entry.filePath) return null;

    const fullPath = `${this.CACHE_DIR}/${entry.filePath}`;
    if (Capacitor.getPlatform() === 'web') {
      const res = await Filesystem.readFile({ path: fullPath, directory: Directory.Cache });
      // Qui non so se è immagine: restituisco data: con mimeType se presente
      const mime = entry.mimeType ?? 'application/octet-stream';
      return `data:${mime};base64,${res.data}`;
    }

    const uri = await Filesystem.getUri({ path: fullPath, directory: Directory.Cache });
    return Capacitor.convertFileSrc(uri.uri);
  }
}