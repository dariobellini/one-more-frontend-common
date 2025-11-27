import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Storage } from '@capacitor/storage';
import { Geolocation } from '@capacitor/geolocation';
import { CoordinatesDto } from '../Dtos/CoordinatesDto';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private cacheKey = 'cached_location';
  private cacheTTL = 10 * 60 * 1000; // 10 minuti
  private readonly EARTH_RADIUS_KM = 6371;

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
  async getCurrentLocation(): Promise<{ latitudine: number; longitudine: number }> {
    // 1. Controlla la cache
    const cachedLocation = await this.getCachedLocation();
    if (cachedLocation) {
      return cachedLocation;
    }

    // 2. Gestione per piattaforma
    if (Capacitor.getPlatform() === 'web') {
      // Browser: usa navigator.geolocation
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const newLocation = {
              latitudine: pos.coords.latitude,
              longitudine: pos.coords.longitude,
              timestamp: Date.now()
            };
            await this.setCachedLocation(newLocation);
            resolve({ latitudine: newLocation.latitudine, longitudine: newLocation.longitudine });
          },
          (err) => {
            console.error('Errore geolocalizzazione browser:', err);
            resolve(this.getFallbackLocation());
          }
        );
      });
    } else {
      // Mobile: usa Capacitor Geolocation
      try {
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
          await this.setCachedLocation(newLocation);
          return { latitudine: newLocation.latitudine, longitudine: newLocation.longitudine };
        }
      } catch (error) {
        console.error('Errore durante il recupero della posizione mobile:', error);
      }
    }

    // 3. Fallback su Roma
    return this.getFallbackLocation();
  }


  public async calculateDistance(lat: number, lon: number): Promise<number> {
    const location = await this.getCachedLocation();

    if (location != null) {
      const dLat = this.toRad(location.latitudine - lat);
      const dLon = this.toRad(location.longitudine - lon);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(location.latitudine)) * Math.cos(this.toRad(lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const result = this.EARTH_RADIUS_KM * c;
      console.log("calculateDistance result:",result);
      return result;
    } else {
      
      console.log("calculateDistance no locations");
      return 0;
    }
  }


  // --- Helpers ---
  private async getCachedLocation(): Promise<{ latitudine: number; longitudine: number } | null> {
    try {
      const cachedLocation = await Storage.get({ key: this.cacheKey });
      if (cachedLocation.value) {
        const { latitudine, longitudine, timestamp } = JSON.parse(cachedLocation.value);
        if (Date.now() - timestamp < this.cacheTTL) {
          return { latitudine, longitudine };
        }
      }
    } catch (error) {
      console.error('Errore nel parsing della cache della posizione:', error);
    }
    return null;
  }

  private async setCachedLocation(location: { latitudine: number; longitudine: number; timestamp: number }) {
    try {
      await Storage.set({ key: this.cacheKey, value: JSON.stringify(location) });
    } catch (error) {
      console.error('Errore nel salvataggio della cache:', error);
    }
  }

  private getFallbackLocation(): { latitudine: number; longitudine: number } {
    return { latitudine: 41.9028, longitudine: 12.4964 }; // Roma
  }
}
