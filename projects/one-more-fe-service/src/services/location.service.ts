import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { CoordinatesDto } from '../Dtos/CoordinatesDto';
import { CacheStorageService } from './cache-storage.service';

interface CachedLocation {
  latitudine: number;
  longitudine:  number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly CACHE_KEY = 'cached_location';
  private readonly CACHE_CATEGORY = 'location-data';
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minuti
  private readonly EARTH_RADIUS_KM = 6371;

  // ✅ Inietta il nuovo servizio
  private cacheService = inject(CacheStorageService);

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  async getCurrentLocation(): Promise<{ latitudine: number; longitudine: number } | null> {
  console.log('[Location] platform =', Capacitor.getPlatform());

  const cachedLocation = await this.getCachedLocation();
  if (cachedLocation) {
    console.log('[Location] using cached location');
    return cachedLocation;
  }

  const isNative = Capacitor.isNativePlatform();
  console.log('[Location] isNative =', isNative);

  if (!isNative) {
    // WEB
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => { /* ... */ },
        (err) => {
          console.error('[Location] browser geolocation error:', err);
          resolve(this.getFallbackLocation());
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  // MOBILE
  try {
    const status = await Geolocation.checkPermissions();
    console.log('[Location] checkPermissions', status);

    let perm = status;
    if (perm.location !== 'granted') {
      perm = await Geolocation.requestPermissions();
      console.log('[Location] requestPermissions', perm);
    }

    if (perm.location === 'granted') {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      const newLocation: CachedLocation = {
        latitudine: position.coords.latitude,
        longitudine: position.coords.longitude,
        timestamp: Date.now()
      };

      await this.setCachedLocation(newLocation);
      return { latitudine: newLocation.latitudine, longitudine: newLocation.longitudine };
    }

    console.warn('[Location] permission not granted, fallback');
    return this.getFallbackLocation();
  } catch (e) {
    console.error('[Location] mobile geolocation error:', e);
    return this.getFallbackLocation();
  }
}

  public async calculateDistance(lat: number, lon: number): Promise<number> {
    const location = await this.getCachedLocation();

    if (location != null) {
      const dLat = this. toRad(location.latitudine - lat);
      const dLon = this.toRad(location.longitudine - lon);

      const a =
        Math. sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(location.latitudine)) * Math.cos(this.toRad(lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const result = this.EARTH_RADIUS_KM * c;
      return result;
    } else {
      return 0;
    }
  }

  // --- Helpers ---

  /**
   * ✅ Recupera la posizione dalla cache usando CacheStorageService
   */
  private async getCachedLocation(): Promise<{ latitudine: number; longitudine:  number } | null> {
    try {
      const cached = await this.cacheService. getJSON<CachedLocation>(
        this.CACHE_KEY,
        this.CACHE_CATEGORY
      );

      if (cached) {
        // Verifica se la cache è ancora valida
        if (Date. now() - cached.timestamp < this.CACHE_TTL) {
          return { 
            latitudine: cached.latitudine, 
            longitudine:  cached.longitudine 
          };
        } else {
          // Cache scaduta, rimuovila
          await this.cacheService.remove(this.CACHE_KEY, this.CACHE_CATEGORY);
        }
      }
    } catch (error) {
      console.error('Errore nel recupero della cache della posizione:', error);
    }
    return null;
  }

  /**
   * ✅ Salva la posizione in cache usando CacheStorageService
   */
  private async setCachedLocation(location: CachedLocation): Promise<void> {
    try {
      await this.cacheService.setJSON(
        this.CACHE_KEY,
        location,
        {
          category: this.CACHE_CATEGORY,
          ttl: this.CACHE_TTL
        }
      );
    } catch (error) {
      console.error('Errore nel salvataggio della cache:', error);
    }
  }

  private getFallbackLocation(): { latitudine: number; longitudine: number } {
    return { latitudine: 41.9028, longitudine: 12.4964 }; // Roma
  }

  /**
   * ✅ Forza il refresh della posizione (utile per pull-to-refresh)
   */
  async refreshLocation(): Promise<{ latitudine: number; longitudine:  number }| null> {
    // Rimuovi la cache
    await this.cacheService. remove(this.CACHE_KEY, this.CACHE_CATEGORY);
    // Ottieni nuova posizione
    return await this.getCurrentLocation();
  }

  /**
   * ✅ Pulisce la cache della posizione
   */
  async clearLocationCache(): Promise<void> {
    await this.cacheService.remove(this.CACHE_KEY, this.CACHE_CATEGORY);
  }
}