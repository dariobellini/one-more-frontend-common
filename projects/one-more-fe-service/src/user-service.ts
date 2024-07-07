import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }

  AddRemoveFavorite(idSoggetto: number, idAttivita: number): Observable<boolean>{

    const params = new HttpParams()
    .set('idSoggetto', idSoggetto.toString())
    .set('idAttivita', idAttivita.toString());

    return this.http.get<boolean>('https://localhost:7253/User/AddRemoveFavorite',{params});
  }
  apiCheckIsFavorite(idSoggetto: number, idAttivita: number): Observable<boolean> {
    const params = new HttpParams()
    .set('idSoggetto', idSoggetto.toString())
    .set('idAttivita', idAttivita.toString());
    return this.http.get<boolean>('https://localhost:7253/User/CheckFavorite', { params });
}
}
