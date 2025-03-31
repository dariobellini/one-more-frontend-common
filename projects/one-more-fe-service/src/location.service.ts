import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private cacheKey = 'cached_location';
  private cacheTTL = 10 * 60 * 1000; // 10 minuti

  async getCurrentLocation(): Promise<{ latitudine: number; longitudine: number }> {
    // Controlla la cache
    const cachedLocation = await Storage.get({ key: this.cacheKey });
    console.log(cachedLocation.value);
    if (cachedLocation.value) {
      try {
        const { latitudine, longitudine, timestamp } = JSON.parse(cachedLocation.value);
        if (Date.now() - timestamp < this.cacheTTL) {
          return { latitudine, longitudine }; // posizione dalla cache
        }
      } catch (error) {
        console.error('Errore nel parsing della cache della posizione:', error);
      }
    }

    try {
      // Verifica e richiede i permessi
      let permStatus = await Geolocation.checkPermissions();

      if (permStatus.location !== 'granted') {
        permStatus = await Geolocation.requestPermissions();
      }

      if (permStatus.location === 'granted') {
        const position = await Geolocation.getCurrentPosition();

        const newLocation = {
          latitudine: position.coords.latitude,
          longitudine: position.coords.longitude,
          timestamp: Date.now()
        };

        await Storage.set({ key: this.cacheKey, value: JSON.stringify(newLocation) });

        return {
          latitudine: newLocation.latitudine,
          longitudine: newLocation.longitudine
        };
      }

    } catch (error) {
      console.error('Errore durante il recupero della posizione:', error);
    }

    // Fallback su Roma
    return { latitudine: 41.9028, longitudine: 12.4964 };
  }
}
