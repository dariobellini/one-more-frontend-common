import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  
  private languageSubject: BehaviorSubject<string>;
  language$;

  constructor(
    private translate: TranslateService,
    private storageService: StorageService
  ) {
    const savedLang = this.getLanguageSession(); // recupera da localStorage o default
    this.languageSubject = new BehaviorSubject<string>(savedLang);
    this.language$ = this.languageSubject.asObservable();

    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  async saveLanguageSession(language: string) {
    await this.storageService.clearAfterChangeLanguage();

    localStorage.setItem('language', language);
    this.translate.use(language);
    this.languageSubject.next(language); // aggiorna correttamente
  }

  getLanguageSession(): string {
    return localStorage.getItem('language') || 'it';
  }
}
