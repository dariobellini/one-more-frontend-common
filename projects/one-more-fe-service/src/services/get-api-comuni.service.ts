import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Constants } from '../Constants';
import { LanguageService } from './language.service';
import { Municipality } from '../Dtos/MunicipalityDto';

@Injectable({
  providedIn: 'root'
})
export class GetApiComuniService {
  language: string | undefined;
  // private listaComuniSubject = new BehaviorSubject<Municipality[] | null>(null);

  http = inject(HttpClient);
  constants = inject(Constants);
  languageService = inject(LanguageService);

  constructor() { }



  Filter(query: string): Observable<Municipality[] | null> {
    return this.http.get<Municipality[]>(this.constants.BasePath() + '/municipality/filter?query=' + query);
  }
  // setlistaComuni(listaComuni: Municipality[]) {
  //   listaComuni.sort((a, b) => {
  //     const descrizioneA = a.description.toLowerCase();
  //     const descrizioneB = b.description.toLowerCase();
  //     if (descrizioneA < descrizioneB) {
  //       return -1;
  //     }
  //     if (descrizioneA > descrizioneB) {
  //       return 1;
  //     }
  //     return 0;
  //   });
  //   this.listaComuniSubject.next(listaComuni);
  // }
}
