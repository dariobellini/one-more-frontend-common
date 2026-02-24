import { Injectable, inject } from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Constants } from '../Constants';
import { CacheServiceV2 } from './cache-storage.service';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private storage: Storage = inject(Storage);
  private constants = inject(Constants);
  private cache = inject(CacheServiceV2);

  constructor() {}

  async getPhotoThumbnailUrl(fileName: string | undefined): Promise<string | null> {
    if (!fileName) return null;

    try {
      const fileRef = ref(this.storage, fileName + this.constants.Suffix_Photo_Thumbnail());
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero della foto:", err);
      return null;
    }
  }

  async getPhotoUrl(fileName: string | undefined, noFormat: boolean | undefined = false): Promise<string | null> {
    if (!fileName) return null;

    try {
      const path = noFormat ? fileName : fileName + this.constants.Suffix_Photo_Detail();
      const fileRef = ref(this.storage, path);
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero della foto:", err);
      return null;
    }
  }

  async getPhotoUrlWithSuffix(fileName: string | undefined, suffix: string): Promise<string | null> {
    if (!fileName) return null;

    try {
      const fileRef = ref(this.storage, fileName + suffix);
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero della foto:", err);
      return null;
    }
  }

  async getIconUrl(iconName: string | undefined, category: string): Promise<string | null> {
    if (!iconName) return null;

    const cached = await this.cache.get<string>(iconName, { category });
    if (cached) return cached;

    try {
      const fileRef = ref(this.storage, `icons/${iconName}.png`);
      const downloadUrl = await getDownloadURL(fileRef);

      await this.cache.set(iconName, downloadUrl, {
        category,
        ttlMs: 60 * 24 * 60 * 60 * 1000, // 60 giorni
        type: 'text',
      });

      return downloadUrl;
    } catch (err) {
      console.error(`❌ Errore caricamento icona ${iconName}:`, err);
      return null;
    }
  }

  async getIconUrlAvif(iconName: string | undefined): Promise<string | null> {
    if (!iconName) return null;

    try {
      const fileRef = ref(this.storage, `icons/${iconName}.avif`);
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero dell'icona:", err);
      return null;
    }
  }

  async getIconUrlGif(iconName: string | undefined): Promise<string | null> {
    if (!iconName) return null;

    try {
      const fileRef = ref(this.storage, `icons/${iconName}.gif`);
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero dell'icona:", err);
      return null;
    }
  }
}