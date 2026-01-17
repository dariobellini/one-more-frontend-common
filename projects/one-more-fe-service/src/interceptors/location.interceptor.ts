import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LocationService } from '../services/location.service';

@Injectable()
export class LocationInterceptor implements HttpInterceptor {
  constructor(private locationService: LocationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ottieni la location come Promise e trasformala in Observable
    return from(this.locationService.getCurrentLocation()).pipe(
      switchMap(location => {
        const cloned = req.clone({
          setHeaders: {
            'X-Latitude': location?.latitudine.toString() || '',
            'X-Longitude': location?.longitudine.toString() || ''
          }
        });
        return next.handle(cloned);
      })
    );
  }
}
