import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, catchError, switchMap } from 'rxjs';
import { TokenService } from '../Auth/token.service';
import { NewAuthService } from '../Auth/new-auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  tokenService = inject(TokenService);
  newAuthService = inject(NewAuthService);

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    if (this.isRefreshRequest(request.url)) {
      return next.handle(request);
    }

    if (token && !this.tokenService.hasValidToken()) {
      return this.newAuthService.refreshJwt().pipe(
        switchMap((jwt) => {
          const refreshedRequest = this.addAuthHeader(request, jwt.jwt);
          return next.handle(refreshedRequest);
        }),
        catchError(() => {
          const fallbackRequest = this.addAuthHeader(request, token);
          return next.handle(fallbackRequest);
        })
      );
    }

    if (token) {
      request = this.addAuthHeader(request, token);
    }

    return next.handle(request);
  }

  private addAuthHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isRefreshRequest(url: string): boolean {
    return /\/auth\/refresh-jwt(?:\?|$)/i.test(url);
  }
}
