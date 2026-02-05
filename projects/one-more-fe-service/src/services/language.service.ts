import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheStorageService } from './cache-storage.service';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  
  private readonly LANGUAGE_KEY = 'app_language';
  private readonly LANGUAGE_CATEGORY = 'settings';
  private readonly DEFAULT_LANGUAGE = 'it';
  
  // ✅ Inizializza subito con il default
  private languageSubject:  BehaviorSubject<string> = new BehaviorSubject<string>(this.DEFAULT_LANGUAGE);
  language$: Observable<string> = this. languageSubject.asObservable();

  translate = inject(TranslateService);
  cacheService = inject(CacheStorageService);

  constructor() {
    this.initializeLanguage();
  }

  /**
   * ✅ Inizializza la lingua in modo asincrono
   */
  private async initializeLanguage(): Promise<void> {
    const savedLang = await this.getLanguageSession();
    
    // Aggiorna il BehaviorSubject con la lingua salvata
    this.languageSubject.next(savedLang);

    // Configura il traduttore
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  /**
   * ✅ Salva la lingua selezionata
   */
  async saveLanguageSession(language: string): Promise<void> {
    // Pulisci la cache quando cambia lingua
    await this.clearCacheOnLanguageChange();

    // Salva la nuova lingua usando Preferences (cross-platform)
    await Preferences.set({
      key: this.LANGUAGE_KEY,
      value: language
    });

    // Aggiorna anche nella cache per compatibilità
    await this.cacheService.setText(
      this.LANGUAGE_KEY,
      language,
      {
        category: this.LANGUAGE_CATEGORY,
        ttl: 0 // Nessuna scadenza
      }
    );

    // Aggiorna i traduttori
    this.translate. use(language);
    this.languageSubject.next(language);
  }

  /**
   * ✅ Recupera la lingua salvata (asincrono)
   */
  async getLanguageSession(): Promise<string> {
    try {
      // Prova a recuperare da Preferences (nativo)
      const { value } = await Preferences.get({ key: this.LANGUAGE_KEY });
      
      if (value) {
        return value;
      }

      // Fallback:  prova dalla cache
      const cached = await this.cacheService. getText(
        this.LANGUAGE_KEY,
        this. LANGUAGE_CATEGORY
      );

      return cached || this.DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Errore nel recupero della lingua:', error);
      return this.DEFAULT_LANGUAGE;
    }
  }

  /**
   * ✅ Ottieni la lingua corrente (sincrono)
   * Usa questo nei tuoi servizi invece di getLanguageSession()
   */
  getCurrentLanguage(): string {
    return this. languageSubject.value;
  }

  /**
   * ✅ Pulisce la cache quando cambia lingua
   */
  private async clearCacheOnLanguageChange(): Promise<void> {
    try {

      // Pulisci le categorie che contengono dati tradotti
      await this.cacheService.clearCategory('api-cache');
      await this.cacheService.clearCategory('promo-icons');
    } catch (error) {
      console.error('❌ Errore nella pulizia della cache:', error);
    }
  }

  /**
   * ✅ Ottieni l'Observable della lingua corrente
   */
  getCurrentLanguage$(): Observable<string> {
    return this.language$;
  }

  /**
   * ✅ Verifica se una lingua è supportata
   */
  isSupportedLanguage(lang: string): boolean {
    const supportedLanguages = ['it', 'en', 'es', 'fr', 'de'];
    return supportedLanguages. includes(lang. toLowerCase());
  }

  /**
   * ✅ Resetta alla lingua di default
   */
  async resetToDefault(): Promise<void> {
    await this.saveLanguageSession(this.DEFAULT_LANGUAGE);
  }
}