import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { AppCheck, getToken } from '@angular/fire/app-check';

@Injectable()
export class AppCheckInterceptor implements HttpInterceptor {

    private appCheckToken: string | null = null;
    private appCheckTokenRefreshTime: number | null = null;
    private readonly TOKEN_VALIDITY_DURATION = 60 * 60 * 1000; // 1 ora

  constructor(private appCheck: AppCheck) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleRequest(req, next));
  }

  private async handleRequest(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const appCheckToken = await this.getAppCheckToken();
  
    const modifiedReq = req.clone({
      setHeaders: {
        'X-Firebase-AppCheck': appCheckToken
      }
    });
  
    try {
      const response = await next.handle(modifiedReq).toPromise();
      if (!response) {
        throw new Error('La risposta HTTP è undefined');
      }
      return response;
    } catch (error) {
      console.error('Errore durante la richiesta HTTP:', error);
      throw error; // Rilancia l'errore per farlo gestire al chiamante
    }
  }

  private async getAppCheckToken(): Promise<string> {
    const now = Date.now();
  
      // Controlla se il token esiste e non è scaduto
      if (this.appCheckToken && this.appCheckTokenRefreshTime && now < this.appCheckTokenRefreshTime) {
        return this.appCheckToken;
      }
  
      // Ottieni un nuovo token App Check
      const tokenResult = await getToken(this.appCheck);
      this.appCheckToken = tokenResult.token;
  
      // Calcola il tempo di refresh come 1 ora dal momento corrente
      this.appCheckTokenRefreshTime = now + this.TOKEN_VALIDITY_DURATION;
      return this.appCheckToken;
  }

}
