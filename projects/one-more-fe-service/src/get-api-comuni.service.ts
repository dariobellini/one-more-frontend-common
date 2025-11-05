import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comuni } from './EntityInterface/Comuni_CAP';
import { Constants } from './Constants';
import { NewAuthService } from './Auth/new-auth.service';

@Injectable({
  providedIn: 'root'
})
export class GetApiComuniService {
  language : string | undefined;
  private listaComuniSubject = new BehaviorSubject<Comuni[] | null>(null);

  constructor(private http:HttpClient, private constants: Constants,
    private authService: NewAuthService) { }

  apiGetListaComuni(): Observable<Comuni[]>{
    this.language = this.authService.getLanguageSession() || 'it';
    return this.http.get<Comuni[]>(this.constants.BasePath()+'/Comuni/get-comuni', {
      params: {
          lang: this.language.toUpperCase(),
      }
   });
  }
   setlistaComuni(listaComuni:Comuni[]) {
    listaComuni.sort((a, b) => {
        const descrizioneA = a.descComune.toLowerCase();
        const descrizioneB = b.descComune.toLowerCase();
        if (descrizioneA < descrizioneB) {
          return -1;
        }
        if (descrizioneA > descrizioneB) {
          return 1;
        }
        return 0;
      });
      this.listaComuniSubject.next(listaComuni);
    }
}
