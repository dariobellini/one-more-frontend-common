import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Tipi di dato supportati dalla cache
 */
export enum CacheDataType {
  JSON = 'json',
  IMAGE = 'image',
  FILE = 'file',
  TEXT = 'text',
  BINARY = 'binary'
}

/**
 * Opzioni di configurazione per ogni entry in cache
 */
export interface CacheOptions {
  /** Tipo di dato */
  type: CacheDataType;
  /** Time-to-live in millisecondi (0 = nessuna scadenza) */
  ttl?: number;
  /** Categoria per organizzare i dati (es: 'user-images', 'api-cache') */
  category?: string;
  /** Se true, comprime i dati JSON */
  compress?: boolean;
}

/**
 * Entry nella cache
 */
interface CacheEntry {
  key: string;
  type: CacheDataType;
  category: string;
  timestamp: number;
  ttl: number;
  size: number;
  path?:  string; // Per file/immagini
  compressed:  boolean;
}

/**
 * Statistiche della cache
 */
export interface CacheStats {
  totalEntries: number;
  totalSizeMB: number;
  byCategory: Record<string, { count: number; sizeMB: number }>;
  byType: Record<string, { count: number; sizeMB:  number }>;
}

@Injectable({
  providedIn: 'root'
})
export class CacheStorageService {
  private readonly CACHE_DIR = 'app-cache';
  private readonly INDEX_KEY = 'cache_index';
  private readonly MAX_CACHE_SIZE_MB = 100; // Limite totale
  private readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 giorni

  constructor() {
    void this.initialize();
  }

  /**
   * Inizializza la cache
   */
  private async initialize(): Promise<void> {
    try {
      await this.cleanExpiredEntries();
    } catch (error) {
      console.error('Errore nell\'inizializzazione della cache:', error);
    }
  }

  // ========== METODI PUBBLICI - SET ==========

  /**
   * Salva dati JSON nella cache (Preferences)
   */
  async setJSON<T>(key: string, data:  T, options?:  Partial<CacheOptions>): Promise<void> {
    try {
      const opts:  CacheOptions = {
        type: CacheDataType.JSON,
        ttl: options?.ttl ?? this.DEFAULT_TTL,
        category: options?.category ?? 'default',
        compress: options?.compress ?? false
      };

      let jsonString = JSON.stringify(data);
      
      // Compressione opzionale (usando LZ-String se disponibile)
      if (opts.compress && typeof (window as any).LZString !== 'undefined') {
        jsonString = (window as any).LZString.compress(jsonString);
      }

      const size = new Blob([jsonString]).size;

      // Salva in Preferences
      await Preferences.set({
        key: this.getPrefixedKey(key, opts.category ?? 'default'),
        value: jsonString
      });

      // Aggiorna indice
      await this.updateIndex(key, opts, size);
      await this.enforceSizeLimit();
    } catch (error) {
      console.error('Errore nel salvataggio JSON:', error);
      throw error;
    }
  }

  /**
   * Salva un'immagine in cache (Filesystem)
   */
  async setImage(key: string, imageData: string | Blob, options?: Partial<CacheOptions>): Promise<void> {
    try {
      const opts: CacheOptions = {
        type: CacheDataType.IMAGE,
        ttl: options?.ttl ?? this.DEFAULT_TTL,
        category: options?.category ?? 'images',
        compress: false
      };

      let base64Data: string;

      if (typeof imageData === 'string') {
        // Se è già base64, rimuovi il prefixo data: image se presente
        base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      } else {
        // Converti Blob in base64
        base64Data = await this.blobToBase64(imageData);
      }

      const fileName = this.generateFileName(key, 'jpg');
      const path = `${opts.category}/${fileName}`;

      // Salva il file
      await Filesystem.writeFile({
        path: `${this.CACHE_DIR}/${path}`,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });

      const size = Math.ceil((base64Data.length * 3) / 4);

      // Aggiorna indice
      await this.updateIndex(key, { ...opts, path }, size);
      await this.enforceSizeLimit();
    } catch (error) {
      console.error('Errore nel salvataggio immagine:', error);
      throw error;
    }
  }

  /**
   * Salva un file generico in cache (Filesystem)
   */
  async setFile(
    key: string,
    fileData: string,
    extension: string,
    options?:  Partial<CacheOptions>
  ): Promise<void> {
    try {
      const opts:  CacheOptions = {
        type: CacheDataType.FILE,
        ttl: options?.ttl ?? this.DEFAULT_TTL,
        category: options?.category ?? 'files',
        compress: false
      };

      const fileName = this. generateFileName(key, extension);
      const path = `${opts.category}/${fileName}`;

      // Salva il file
      await Filesystem.writeFile({
        path: `${this.CACHE_DIR}/${path}`,
        data: fileData,
        directory: Directory.Cache,
        recursive: true
      });

      const size = new Blob([fileData]).size;

      // Aggiorna indice
      await this.updateIndex(key, { ...opts, path }, size);
      await this.enforceSizeLimit();
    } catch (error) {
      console.error('Errore nel salvataggio file:', error);
      throw error;
    }
  }

  /**
   * Salva testo semplice (Preferences)
   */
  async setText(key: string, text: string, options?: Partial<CacheOptions>): Promise<void> {
    try {
      const opts: CacheOptions = {
        type: CacheDataType.TEXT,
        ttl: options?.ttl ?? this.DEFAULT_TTL,
        category: options?.category ?? 'default',
        compress: false
      };

      const size = new Blob([text]).size;

      await Preferences.set({
        key: this.getPrefixedKey(key, opts.category ?? 'default'),
        value: text
      });

      await this.updateIndex(key, opts, size);
      await this.enforceSizeLimit();
    } catch (error) {
      console.error('Errore nel salvataggio testo:', error);
      throw error;
    }
  }

  // ========== METODI PUBBLICI - GET ==========

  /**
   * Recupera dati JSON dalla cache
   */
  async getJSON<T>(key: string, category:  string = 'default'): Promise<T | null> {
    try {
      const entry = await this.getEntry(key, category);
      
      if (!entry || entry.type !== CacheDataType.JSON) {
        return null;
      }

      // Verifica scadenza
      if (this.isExpired(entry)) {
        await this.remove(key, category);
        return null;
      }

      const { value } = await Preferences.get({
        key: this.getPrefixedKey(key, category)
      });

      if (!value) return null;

      // Decompressione se necessario
      let jsonString = value;
      if (entry. compressed && typeof (window as any).LZString !== 'undefined') {
        jsonString = (window as any).LZString.decompress(value);
      }

      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Errore nel recupero JSON:', error);
      return null;
    }
  }

  /**
   * Recupera un'immagine dalla cache
   * @returns URI utilizzabile in <img> o null
   */
  async getImage(key: string, category: string = 'images'): Promise<string | null> {
    try {
      const entry = await this. getEntry(key, category);
      
      if (!entry || entry.type !== CacheDataType. IMAGE || !entry.path) {
        return null;
      }

      // Verifica scadenza
      if (this.isExpired(entry)) {
        await this.remove(key, category);
        return null;
      }

      // Verifica esistenza file
      try {
        await Filesystem.stat({
          path: `${this.CACHE_DIR}/${entry. path}`,
          directory: Directory.Cache
        });
      } catch {
        await this.remove(key, category);
        return null;
      }

      return await this.getFileUri(entry.path);
    } catch (error) {
      console.error('Errore nel recupero immagine:', error);
      return null;
    }
  }

  /**
   * Recupera un file generico dalla cache
   */
  async getFile(key: string, category: string = 'files'): Promise<string | null> {
    try {
      const entry = await this.getEntry(key, category);
      
      if (! entry || entry.type !== CacheDataType.FILE || !entry. path) {
        return null;
      }

      if (this.isExpired(entry)) {
        await this.remove(key, category);
        return null;
      }

      const result = await Filesystem.readFile({
        path: `${this.CACHE_DIR}/${entry. path}`,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });

      return result. data as string;
    } catch (error) {
      console.error('Errore nel recupero file:', error);
      return null;
    }
  }

  /**
   * Recupera testo dalla cache
   */
  async getText(key: string, category: string = 'default'): Promise<string | null> {
    try {
      const entry = await this.getEntry(key, category);
      
      if (!entry || entry.type !== CacheDataType.TEXT) {
        return null;
      }

      if (this.isExpired(entry)) {
        await this.remove(key, category);
        return null;
      }

      const { value } = await Preferences. get({
        key: this. getPrefixedKey(key, category)
      });

      return value;
    } catch (error) {
      console.error('Errore nel recupero testo:', error);
      return null;
    }
  }

  /**
   * Recupera o esegue una funzione se il dato non è in cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheOptions>
  ): Promise<T> {
    const category = options?.category || 'default';
    
    // Prova a recuperare dalla cache
    const cached = await this.getJSON<T>(key, category);
    if (cached !== null) {
      return cached;
    }

    // Se non è in cache, esegui la funzione
    const data = await fetchFn();
    
    // Salva in cache
    await this.setJSON(key, data, options);
    
    return data;
  }

  // ========== METODI DI GESTIONE ==========

  /**
   * Rimuove un elemento dalla cache
   */
  async remove(key: string, category: string = 'default'): Promise<void> {
    try {
      const entry = await this.getEntry(key, category);
      
      if (!entry) return;

      // Se è un file, eliminalo dal filesystem
      if (entry.path) {
        try {
          await Filesystem.deleteFile({
            path: `${this.CACHE_DIR}/${entry.path}`,
            directory: Directory.Cache
          });
        } catch {
          // File già eliminato
        }
      } else {
        // Altrimenti rimuovilo da Preferences
        await Preferences. remove({
          key: this.getPrefixedKey(key, category)
        });
      }

      // Rimuovi dall'indice
      await this.removeFromIndex(key, category);
    } catch (error) {
      console.error('Errore nella rimozione:', error);
    }
  }

  /**
   * Pulisce tutta la cache
   */
  async clearAll(): Promise<void> {
    try {
      // Rimuovi tutti i file
      await Filesystem.rmdir({
        path: this.CACHE_DIR,
        directory: Directory.Cache,
        recursive: true
      });

      // Rimuovi tutte le preferences con il prefisso cache
      const index = await this.getIndex();
      for (const entry of index) {
        if (! entry.path) {
          await Preferences.remove({
            key: this.getPrefixedKey(entry.key, entry.category)
          });
        }
      }

      // Pulisci l'indice
      await Preferences.remove({ key: this.INDEX_KEY });
    } catch (error) {
      console.error('Errore nella pulizia della cache:', error);
    }
  }

  /**
   * Pulisce la cache per categoria
   */
  async clearCategory(category: string): Promise<void> {
    const index = await this.getIndex();
    const entries = index.filter(e => e.category === category);

    for (const entry of entries) {
      await this.remove(entry.key, entry.category);
    }
  }

  /**
   * Pulisce le entry scadute
   */
  async cleanExpiredEntries(): Promise<void> {
    const index = await this. getIndex();
    const expired = index.filter(e => this.isExpired(e));

    for (const entry of expired) {
      await this.remove(entry.key, entry.category);
    }
  }

  /**
   * Ottieni statistiche della cache
   */
  async getStats(): Promise<CacheStats> {
    const index = await this.getIndex();
    
    const stats: CacheStats = {
      totalEntries: index.length,
      totalSizeMB: 0,
      byCategory: {},
      byType: {}
    };

    for (const entry of index) {
      const sizeMB = entry.size / (1024 * 1024);
      stats.totalSizeMB += sizeMB;

      // Per categoria
      if (! stats.byCategory[entry.category]) {
        stats.byCategory[entry.category] = { count: 0, sizeMB: 0 };
      }
      stats.byCategory[entry.category].count++;
      stats.byCategory[entry.category]. sizeMB += sizeMB;

      // Per tipo
      if (!stats.byType[entry. type]) {
        stats.byType[entry.type] = { count: 0, sizeMB: 0 };
      }
      stats.byType[entry.type].count++;
      stats.byType[entry.type]. sizeMB += sizeMB;
    }

    return stats;
  }

  /**
   * Verifica se una chiave esiste in cache
   */
  async has(key: string, category: string = 'default'): Promise<boolean> {
    const entry = await this.getEntry(key, category);
    return entry !== null && ! this.isExpired(entry);
  }

  // ========== METODI PRIVATI ==========

  private async getIndex(): Promise<CacheEntry[]> {
    try {
      const { value } = await Preferences.get({ key: this.INDEX_KEY });
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  private async saveIndex(index: CacheEntry[]): Promise<void> {
    await Preferences.set({
      key: this.INDEX_KEY,
      value: JSON. stringify(index)
    });
  }

  private async updateIndex(
    key: string,
    options: CacheOptions & { path?: string },
    size: number
  ): Promise<void> {
    await this.withIndexLock(async () => {
      const index = await this.getIndex();
      
      // Rimuovi entry esistente
      const filtered = index.filter(
        e => !(e.key === key && e.category === options.category)
      );

      // Aggiungi nuova entry
      filtered.push({
        key,
        type: options.type,
        category: options.category || 'default',
        timestamp:  Date.now(),
        ttl: options.ttl || this.DEFAULT_TTL,
        size,
        path: options. path,
        compressed: options.compress || false
      });
      await this.saveIndex(filtered);
    });
  }

  private indexLock: Promise<void> = Promise.resolve();

  private async withIndexLock(fn: () => Promise<void>): Promise<void> {
    this.indexLock = this.indexLock.then(fn).catch(() => {});
    return this.indexLock;
  }

  private async removeFromIndex(key: string, category: string): Promise<void> {
    const index = await this. getIndex();
    const filtered = index.filter(
      e => !(e.key === key && e.category === category)
    );
    await this.saveIndex(filtered);
  }

  private async getEntry(key: string, category:  string): Promise<CacheEntry | null> {
    const index = await this.getIndex();
    return index.find(e => e.key === key && e.category === category) || null;
  }

  private isExpired(entry: CacheEntry): boolean {
    if (entry.ttl === 0) return false; // Nessuna scadenza
    return (Date.now() - entry.timestamp) > entry.ttl;
  }

  private async enforceSizeLimit(): Promise<void> {
    const index = await this.getIndex();
    const totalSizeMB = index.reduce((sum, e) => sum + e.size, 0) / (1024 * 1024);

    if (totalSizeMB > this.MAX_CACHE_SIZE_MB) {
      // Ordina per timestamp (più vecchie prima)
      const sorted = [...index].sort((a, b) => a.timestamp - b.timestamp);

      let currentSize = totalSizeMB;
      for (const entry of sorted) {
        if (currentSize <= this.MAX_CACHE_SIZE_MB * 0.8) break; // Libera il 20%
        
        await this.remove(entry. key, entry.category);
        currentSize -= entry.size / (1024 * 1024);
      }
    }
  }

  private getPrefixedKey(key: string, category: string): string {
    return `cache_${category}_${key}`;
  }

  private generateFileName(key: string, extension: string): string {
    const hash = this.simpleHash(key);
    const timestamp = Date.now();
    return `${hash}_${timestamp}.${extension}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async getFileUri(path: string): Promise<string> {
    try {
      const fullPath = `${this.CACHE_DIR}/${path}`;
      
      if (Capacitor.getPlatform() === 'web') {
        const result = await Filesystem.readFile({
          path: fullPath,
          directory: Directory.Cache
        });
        return `data:image/jpeg;base64,${result.data}`;
      }

      const stat = await Filesystem.getUri({
        path: fullPath,
        directory: Directory.Cache
      });
      
      return Capacitor.convertFileSrc(stat.uri);
    } catch (error) {
      console.error('Errore nel recupero URI:', error);
      throw error;
    }
  }
}