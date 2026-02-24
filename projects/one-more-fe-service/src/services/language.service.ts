import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { CacheServiceV2 } from './cache-storage.service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly LANGUAGE_KEY = 'app_language';
  private readonly DEFAULT_LANGUAGE = 'it';

  private languageSubject = new BehaviorSubject<string>(this.DEFAULT_LANGUAGE);
  language$: Observable<string> = this.languageSubject.asObservable();

  private translate = inject(TranslateService);
  private cache = inject(CacheServiceV2);

  constructor() {
    void this.initializeLanguage();
  }

  private async initializeLanguage(): Promise<void> {
    const savedLang = await this.getLanguageSession();
    this.languageSubject.next(savedLang);
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  async saveLanguageSession(language: string): Promise<void> {
    const lang = this.normalizeLanguage(language);
    await this.clearCacheOnLanguageChange();
    await Preferences.set({
      key: this.LANGUAGE_KEY,
      value: lang
    });

    this.translate.use(lang);
    this.languageSubject.next(lang);
  }

  async getLanguageSession(): Promise<string> {
    try {
      const { value } = await Preferences.get({ key: this.LANGUAGE_KEY });
      const lang = this.normalizeLanguage(value ?? this.DEFAULT_LANGUAGE);
      return lang;
    } catch (error) {
      console.error('Errore nel recupero della lingua:', error);
      return this.DEFAULT_LANGUAGE;
    }
  }

  getCurrentLanguage(): string {
    return this.languageSubject.value;
  }

  getCurrentLanguage$(): Observable<string> {
    return this.language$;
  }

  async resetToDefault(): Promise<void> {
    await this.saveLanguageSession(this.DEFAULT_LANGUAGE);
  }

  isSupportedLanguage(lang: string): boolean {
    return ['it', 'en', 'es', 'fr', 'de'].includes((lang ?? '').toLowerCase());
  }

  private normalizeLanguage(lang: string): string {
    const l = (lang ?? '').toLowerCase().trim();
    return this.isSupportedLanguage(l) ? l : this.DEFAULT_LANGUAGE;
  }

  private async clearCacheOnLanguageChange(): Promise<void> {
    try {
      await this.cache.clearCategory('api-cache');
      await this.cache.clearCategory('promo-icons');
    } catch (error) {
      console.error('❌ Errore nella pulizia della cache:', error);
    }
  }
}