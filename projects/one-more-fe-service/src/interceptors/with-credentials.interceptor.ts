import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';

@Injectable()
export class WithCredentialsInterceptor implements HttpInterceptor {
  private constants = inject(Constants);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(this.constants.BasePath())) {
      request = request.clone({ withCredentials: true });
    }
    return next.handle(request);
  }
}
