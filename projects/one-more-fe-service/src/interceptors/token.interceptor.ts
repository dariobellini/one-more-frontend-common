import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { Auth, getIdToken } from '@angular/fire/auth';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private auth = inject(Auth);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.auth.currentUser;

    if (!user) {
      return next.handle(request);
    }

    return from(getIdToken(user)).pipe(
      switchMap((token) => {
        const cloned = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(cloned);
      })
    );
  }
}