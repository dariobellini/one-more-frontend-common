import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { CacheServiceV2 } from './cache-storage.service';

interface CachedLocation {
  latitudine: number;
  longitudine: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly CACHE_KEY = 'cached_location';
  private readonly CACHE_CATEGORY = 'location-data';
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minuti
  private readonly EARTH_RADIUS_KM = 6371;

  private cache = inject(CacheServiceV2);

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  async getCurrentLocation(): Promise<{ latitudine: number; longitudine: number } | null> {
    const cached = await this.getCachedLocation();
    if (cached) return cached;

    if (Capacitor.getPlatform() === 'web') {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const loc: CachedLocation = {
              latitudine: pos.coords.latitude,
              longitudine: pos.coords.longitude,
            };

            await this.setCachedLocation(loc);
            resolve(loc);
          },
          (err) => {
            console.error('Errore geolocalizzazione browser:', err);
            resolve(this.getFallbackLocation());
          }
        );
      });
    }

    try {
      let permStatus = await Geolocation.checkPermissions();
      if (permStatus.location !== 'granted') {
        permStatus = await Geolocation.requestPermissions();
      }

      if (permStatus.location === 'granted') {
        const position = await Geolocation.getCurrentPosition();
        const loc: CachedLocation = {
          latitudine: position.coords.latitude,
          longitudine: position.coords.longitude,
        };

        await this.setCachedLocation(loc);
        return loc;
      }
    } catch (error) {
      console.error('Errore durante il recupero della posizione mobile:', error);
    }

    return this.getFallbackLocation();
  }

  async calculateDistance(lat: number, lon: number): Promise<number> {
    const location = await this.getCachedLocation();
    if (!location) return 0;

    const dLat = this.toRad(location.latitudine - lat);
    const dLon = this.toRad(location.longitudine - lon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(location.latitudine)) *
        Math.cos(this.toRad(lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  private async getCachedLocation(): Promise<CachedLocation | null> {
    try {
      return await this.cache.get<CachedLocation>(this.CACHE_KEY, {
        category: this.CACHE_CATEGORY,
      });
    } catch (error) {
      console.error('Errore nel recupero cache posizione:', error);
      return null;
    }
  }

  private async setCachedLocation(location: CachedLocation): Promise<void> {
    try {
      await this.cache.set(this.CACHE_KEY, location, {
        category: this.CACHE_CATEGORY,
        ttlMs: this.CACHE_TTL,
        type: 'json',
      });
    } catch (error) {
      console.error('Errore nel salvataggio cache posizione:', error);
    }
  }

  private getFallbackLocation(): CachedLocation {
    return { latitudine: 41.9028, longitudine: 12.4964 }; // Roma
  }

  async refreshLocation(): Promise<CachedLocation | null> {
    await this.cache.remove(this.CACHE_KEY, { category: this.CACHE_CATEGORY });
    return this.getCurrentLocation();
  }

  async clearLocationCache(): Promise<void> {
    await this.cache.remove(this.CACHE_KEY, { category: this.CACHE_CATEGORY });
  }
}