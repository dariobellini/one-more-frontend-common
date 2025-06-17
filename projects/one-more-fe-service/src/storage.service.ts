import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  async setItem(key: string, value: any, ttl: number = 3600) {
    const expirationTime = Date.now() + ttl * 1000;
    const dataToStore = { value, expirationTime };

    try {
      const compressed = compressToUTF16(JSON.stringify(dataToStore));
      await Storage.set({ key, value: compressed });
    } catch (error) {
      console.error('Errore nel salvataggio compressione:', error);
    }
  }

  async getItem(key: string): Promise<any | null> {
    try {
      const storedData = await Storage.get({ key });
      if (!storedData.value) return null;

      const decompressed = decompressFromUTF16(storedData.value);
      const { value, expirationTime } = JSON.parse(decompressed);

      if (Date.now() > expirationTime) {
        await Storage.remove({ key });
        return null;
      }

      return value;
    } catch (error) {
      console.error('Errore nella lettura/decompressione:', error);
      return null;
    }
  }

  async removeItem(key: string) {
    await Storage.remove({ key });
  }

  async clearAll() {
    await Storage.clear();
  }
}
