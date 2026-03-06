import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../Auth/token.service';
import { NewAuthService } from '../Auth/new-auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  tokenService = inject(TokenService);
  newAuthService = inject(NewAuthService);

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Do not attempt to refresh proactively here; instead attach the current token
    // (if present) and handle 401 responses centrally.
    if (this.isRefreshRequest(request.url)) {
      return next.handle(request);
    }

    const token = this.tokenService.getToken();
    if (token) {
      request = this.addAuthHeader(request, token);
    }

    return next.handle(request).pipe(
      catchError((err) => {
        // If we get a 401, try a single refresh and retry the original request.
        if (err && err.status === 401 && !this.isRefreshRequest(request.url)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Use NewAuthService.refreshJwt() which already deduplicates concurrent refreshes.
    return this.newAuthService.refreshJwt().pipe(
      switchMap((jwt) => {
        const newToken = jwt?.jwt ?? this.tokenService.getToken();
        if (!newToken) {
          // No token after refresh -> force logout flow
          void this.newAuthService.logOut();
          return throwError(() => new Error('Unable to refresh token'));
        }
        const cloned = this.addAuthHeader(request, newToken);
        return next.handle(cloned);
      }),
      catchError((refreshErr) => {
        // Refresh failed -> clear tokens and logout
        void this.tokenService.clearToken();
        void this.newAuthService.logOut();
        return throwError(() => refreshErr);
      })
    );
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
