import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { AppCheck, getToken } from '@angular/fire/app-check';

@Injectable()
export class AppCheckInterceptor implements HttpInterceptor {

  // Usa inject per recuperare l'istanza AppCheck fornita da Angular
  private appCheck = inject(AppCheck);

  // Cache del token per ridurre chiamate ridondanti
  private appCheckToken: string | null = null;
  private tokenExpireTime: number | null = null;
  private readonly TOKEN_VALIDITY_DURATION = 60 * 60 * 1000; // 1 ora

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleRequest(req, next));
  }

  private async handleRequest(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const token = await this.getAppCheckToken();

    // Clona la richiesta aggiungendo l'header AppCheck
    const modifiedReq = req.clone({
      setHeaders: {
        'X-Firebase-AppCheck': token
      }
    });

    try { const response = await next.handle(modifiedReq).toPromise(); return response!; } catch (error) { console.error('Errore durante la richiesta HTTP:', error); throw error; }
  }

  private async getAppCheckToken(): Promise<string> {
    const now = Date.now();

    // Se il token è valido, lo riutilizziamo
    if (this.appCheckToken && this.tokenExpireTime && now < this.tokenExpireTime) {
      return this.appCheckToken;
    }

    // Altrimenti richiedi un nuovo token da Firebase AppCheck
    const tokenResult = await getToken(this.appCheck);

    this.appCheckToken = tokenResult.token;
    this.tokenExpireTime = now + this.TOKEN_VALIDITY_DURATION;

    return this.appCheckToken;
  }
}
