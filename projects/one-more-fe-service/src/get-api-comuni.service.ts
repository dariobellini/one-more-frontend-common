import { Attivita, TipoAttivita } from './EntityInterface/Attivita';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map } from 'rxjs';
import { Comuni, Comuni_CAP } from './EntityInterface/Comuni_CAP';

@Injectable({
  providedIn: 'root'
})
export class GetApiComuniService {

  constructor(private http:HttpClient) { }

  apiGetListaComuni(): Observable<Comuni[]>{
    return this.http.get<Comuni[]>('https://localhost:7253/Comuni/get-comuni');
  }

}
