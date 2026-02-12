import { Injectable, inject } from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Constants } from '../Constants';
import { CacheStorageService } from './cache-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private storage: Storage = inject(Storage);
  constants = inject(Constants);
  cacheService = inject(CacheStorageService);

  constructor() {}

  /**
   * Recupera l'URL di download per una foto thumbnail
   * @param fileName Nome del file della foto
   * @returns URL della foto o null in caso di errore
   */
  async getPhotoThumbnailUrl(fileName: string | undefined): Promise<string | null> {
    if (!fileName) {
      return null;
    }

    try {
      const fileRef = ref(this.storage, fileName + this.constants.Suffix_Photo_Thumbnail());
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero della foto:", err);
      return null;
    }
  }

  /**
   * Recupera l'URL di download per una foto completa
   * @param fileName Nome del file della foto
   * @returns URL della foto o null in caso di errore
   */
  async getPhotoUrl(fileName: string | undefined, noFormat: boolean | undefined = false): Promise<string | null> {
    if (!fileName) {
      return null;
    }

    try {
      if(noFormat){
        const fileRef = ref(this.storage, fileName);
        return await getDownloadURL(fileRef);
      }
      const fileRef = ref(this.storage, fileName+ this.constants.Suffix_Photo_Detail());
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero della foto:", err);
      return null;
    }
  }

  /**
   * Recupera l'URL di download per una foto con un suffisso personalizzato
   * @param fileName Nome del file della foto
   * @param suffix Suffisso da aggiungere al nome del file
   * @returns URL della foto o null in caso di errore
   */
  async getPhotoUrlWithSuffix(fileName: string | undefined, suffix: string): Promise<string | null> {
    if (!fileName) {
      return null;
    }

    try {
      const fileRef = ref(this.storage, fileName + suffix);
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero della foto:", err);
      return null;
    }
  }

  /**
   * Recupera l'URL di download per un'icona PNG
   * @param iconName Nome del file dell'icona (es: "icon-name.png")
   * @returns URL dell'icona o null in caso di errore
   */

  async getIconUrl(iconName: string | undefined, category: string): Promise<string | null> {

    if (!iconName) {
      return null;
     }

    const cachedIcon = await this.cacheService. getJSON<string>(iconName, category);

    if (cachedIcon) {
      return cachedIcon;
    }
    else{
      try {
      const fileRef = ref(this.storage, `icons/${iconName}.png`);
      const downloadUrl = await getDownloadURL(fileRef);
      await this.cacheService.setJSON(iconName, downloadUrl, {
        category: category,
        ttl: 60 * 24 * 60 * 60 * 1000 // 60 giorni
      });

      return downloadUrl;

    } catch (err) {
      console.error(`❌ Errore caricamento icona ${iconName}:`, err);
      return null;
      }
    } 
  }

  async getIconUrlAvif(iconName: string | undefined): Promise<string | null> {
     if (!iconName) {
      return null;
     }

    try {
      const fileRef = ref(this.storage, `icons/${iconName}.avif`);
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero dell'icona:", err);
      return null;
    }
  }

  async getIconUrlGif(iconName: string | undefined): Promise<string | null> {
     if (!iconName) {
      return null;
     }

    try {
      const fileRef = ref(this.storage, `icons/${iconName}.gif`);
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error("Errore Firebase nel recupero dell'icona:", err);
      return null;
    }
  }
}
