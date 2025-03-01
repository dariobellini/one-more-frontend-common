import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private cacheKey = 'cached_location';
  private cacheTTL = 10 * 60 * 1000; // 10 minuti in millisecondi

  async getCurrentLocation(): Promise<{ latitudine: number; longitudine: number }> {
    // Controlla la cache
    const cachedLocation = await Storage.get({ key: this.cacheKey });
    if (cachedLocation.value) {
      try {
        const { latitudine, longitudine, timestamp } = JSON.parse(cachedLocation.value);
        if (Date.now() - timestamp < this.cacheTTL) {
          return { latitudine, longitudine }; // Restituisci la posizione dalla cache
        }
      } catch (error) {
        console.error('Errore nel parsing della cache della posizione:', error);
      }
    }

    // Se la cache è scaduta o non esiste, ottieni una nuova posizione
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const newLocation = {
        latitudine: position.coords.latitude,
        longitudine: position.coords.longitude,
        timestamp: Date.now()
      };

      // Salva nella cache
      await Storage.set({ key: this.cacheKey, value: JSON.stringify(newLocation) });

      return { latitudine: newLocation.latitudine, longitudine: newLocation.longitudine };
    } catch (error) {
      console.warn('Errore nel recupero della posizione, uso posizione predefinita:', error);
      return { latitudine: 41.9028, longitudine: 12.4964 }; // Roma come fallback
    }
  }
}
