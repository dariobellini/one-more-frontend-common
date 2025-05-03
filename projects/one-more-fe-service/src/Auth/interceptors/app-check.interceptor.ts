import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { getToken, AppCheck } from '@angular/fire/app-check';

@Injectable()
export class AppCheckInterceptor implements HttpInterceptor {
  private appCheckToken: string | null = null;
  private appCheckTokenRefreshTime: number | null = null;
  private readonly TOKEN_VALIDITY_DURATION = 60 * 60 * 1000;

  constructor(private appCheck: AppCheck) {} // ✅ Usa AngularFire AppCheck

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
      return response!;
    } catch (error) {
      console.error('Errore durante la richiesta HTTP:', error);
      throw error;
    }
  }

  private async getAppCheckToken(): Promise<string> {
    const now = Date.now();

    if (this.appCheckToken && this.appCheckTokenRefreshTime && now < this.appCheckTokenRefreshTime) {
      return this.appCheckToken;
    }

    const tokenResult = await getToken(this.appCheck); // ✅ Usa l'istanza iniettata

    this.appCheckToken = tokenResult.token;
    this.appCheckTokenRefreshTime = now + this.TOKEN_VALIDITY_DURATION;
    return this.appCheckToken;
  }
}
