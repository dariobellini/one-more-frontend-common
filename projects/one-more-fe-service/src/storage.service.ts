import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  async setItem(key: string, value: any, ttl: number = 3600) { // ttl = 3600s = 1 ora
    const expirationTime = Date.now() + ttl * 1000; // Converte TTL in millisecondi
    const dataToStore = { value, expirationTime };
    await Storage.set({ key, value: JSON.stringify(dataToStore) });
  }

  async getItem(key: string): Promise<any | null> {
    const storedData = await Storage.get({ key });
    if (!storedData.value) return null;

    try {
      const { value, expirationTime } = JSON.parse(storedData.value);

      if (Date.now() > expirationTime) {
        await Storage.remove({ key }); // Cancella i dati scaduti
        return null;
      }

      return value;
    } catch (error) {
      console.error('Errore nel parsing dei dati in cache:', error);
      return null;
    }
  }

  async removeItem(key: string) {
    await Storage.remove({ key });
  }
}
