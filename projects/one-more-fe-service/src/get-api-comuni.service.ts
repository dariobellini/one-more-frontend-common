import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comuni } from './EntityInterface/Comuni_CAP';
import { Constants } from './Constants';
import { AuthService } from './Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GetApiComuniService {
  language : string | undefined;

  constructor(private http:HttpClient, private constants: Constants,
    private authService: AuthService) { }

  apiGetListaComuni(): Observable<Comuni[]>{
    this.language = this.authService.getLanguageSession() || 'it';
    return this.http.get<Comuni[]>(this.constants.BasePath()+'/Comuni/get-comuni', {
      params: {
          lang: this.language.toUpperCase(),
      }
   });
  }
}
