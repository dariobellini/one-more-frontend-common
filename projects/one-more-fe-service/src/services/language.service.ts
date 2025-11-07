import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../storage.service';

@Injectable({
    providedIn: 'root'
})

export class LanguageService {

    private languageSubject = new BehaviorSubject<string>('IT'); // Stato iniziale
    language$ = this.languageSubject.asObservable();

    constructor(private translate: TranslateService,
                private storageService: StorageService
    ) {
        const savedLang = this.getLanguageSession();
        this.translate.setDefaultLang(savedLang);
        this.translate.use(savedLang);
        this.languageSubject.next(savedLang);
     }

    async saveLanguageSession(language: string) {
      await this.storageService.clearAfterChangeLanguage();

      localStorage.setItem('language', language);
      this.translate.use(language); // Cambia la lingua
      this.languageSubject.next(language); // Notifica i componenti che la lingua è cambiata
    }

    getLanguageSession(): string {
      return localStorage.getItem('language') || 'it';
    }
}