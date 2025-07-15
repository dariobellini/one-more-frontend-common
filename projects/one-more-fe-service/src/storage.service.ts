import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { Attivita } from './EntityInterface/Attivita';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  listaAtt: Attivita [] | undefined;
  attivita: Attivita | undefined;

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

  async clearAfterChangeLanguage() {
    const cacheKeylista_attivita = `lista_attivita`;

    const cachedDatalista_attivita = await this.getItem(cacheKeylista_attivita);
    if (cachedDatalista_attivita) {
        this.listaAtt = cachedDatalista_attivita;
        if (this.listaAtt && this.listaAtt.length > 0) {
          for (const att of this.listaAtt) {
            const cacheKeyatt = `attivita_${att.idAttivita}`;
            await this.removeItem(cacheKeyatt);
          }
        }
        await this.removeItem(cacheKeylista_attivita);
      }
      const cacheKeyAttivita_promo = `attivita_promo`;
      const cachedDataAttivita_promo = await this.getItem(cacheKeyAttivita_promo);
      if (cachedDataAttivita_promo) {
        await this.removeItem(cacheKeyAttivita_promo);
      }

      const cacheKeyAttivita_favoriti = `attivita_favoriti`;
      const cachedDataAttivita_favoriti = await this.getItem(cacheKeyAttivita_favoriti);
      if (cachedDataAttivita_favoriti) {
        await this.removeItem(cacheKeyAttivita_favoriti);
      }
  }
}
