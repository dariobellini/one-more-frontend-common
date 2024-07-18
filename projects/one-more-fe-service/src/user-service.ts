import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from './Constants';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient, 
              private constants:Constants) { }

  AddRemoveFavorite(idSoggetto: number, idAttivita: number): Observable<boolean>{

    const params = new HttpParams()
    .set('idSoggetto', idSoggetto.toString())
    .set('idAttivita', idAttivita.toString());

    return this.http.get<boolean>(this.constants.BasePath()+'/User/AddRemoveFavorite',{params});
  }
  apiCheckIsFavorite(idSoggetto: number, idAttivita: number): Observable<boolean> {
    const params = new HttpParams()
    .set('idSoggetto', idSoggetto.toString())
    .set('idAttivita', idAttivita.toString());
    return this.http.get<boolean>(this.constants.BasePath()+'/User/CheckFavorite', { params });
}
}
