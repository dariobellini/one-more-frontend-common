import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../Constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private constants: Constants) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if(req.url.includes(this.constants.BasePath())){
       
      // Ottieni il token JWT dal servizio Auth (ad esempio, dal localStorage)
      const token = localStorage.getItem(this.constants.UserApiJwt());;
 
      if (token) {
        // Se il token esiste, aggiungi l'header Authorization alla richiesta
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        return next.handle(cloned);
        
      }
    }

    // Se il token non esiste, invia la richiesta senza modificarla
    return next.handle(req);
  }
}
