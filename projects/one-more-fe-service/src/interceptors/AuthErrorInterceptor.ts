import { inject, Injectable, NgZone } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NewAuthService } from '../Auth/new-auth.service';

@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {
  private handled401 = false;

  private auth = inject(NewAuthService);
  private router = inject(Router);
  private zone = inject(NgZone);

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {

        // evita loop se più chiamate falliscono insieme
        if ((err.status === 401 || err.status === 403) && !this.handled401) {
          this.handled401 = true;

          // emette loggedIn=false + pulisce token ecc.
          void this.auth.logOut().finally(() => {
            this.zone.run(() => this.router.navigate(['/login']));
            setTimeout(() => (this.handled401 = false), 1500);
          });
        }

        return throwError(() => err);
      })
    );
  }
}