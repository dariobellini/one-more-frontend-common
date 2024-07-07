import { Attivita, TipoAttivita } from './EntityInterface/Attivita';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map } from 'rxjs';
import { Menu, Dec_TipologiaMenu, Prodotto } from './EntityInterface/Menu';

@Injectable({
  providedIn: 'root'
})
export class GetApiMenuService {

  constructor(private http:HttpClient) { }

  apiGetListaDecMenu(): Observable<Dec_TipologiaMenu[]>{
    return this.http.get<Dec_TipologiaMenu[]>('https://localhost:7253/Menu/get-comuni');
  }
}
