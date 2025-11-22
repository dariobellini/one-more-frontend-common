import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LanguageService } from '../services/language.service';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const langService = this.injector.get(LanguageService); // risolto runtime
    const currentLang = langService.getLanguageSession();

    const cloned = req.clone({
      setHeaders: {
        'Accept-Language': currentLang
      }
    });

    return next.handle(cloned);
  }
}
