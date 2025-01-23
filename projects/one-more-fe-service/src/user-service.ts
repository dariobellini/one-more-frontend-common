import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from './Constants';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient, 
              private constants:Constants) { }

  async AddRemoveFavorite(idSoggetto: number, idAttivita: number): Promise<boolean> {
    const params = new HttpParams()
      .set('idSoggetto', idSoggetto.toString())
      .set('idAttivita', idAttivita.toString());
  
    try {
      // Usa firstValueFrom per convertire l'observable in una Promise
      const result = await firstValueFrom(
        this.http.get<boolean>(this.constants.BasePath() + '/User/AddRemoveFavorite', { params })
      );
      return result;
    } catch (error) {
      console.error('Errore durante la chiamata HTTP:', error);
      throw error; // Puoi gestire diversamente l'errore se necessario
    }
  }
  
  apiCheckIsFavorite(idSoggetto: number, idAttivita: number): Observable<boolean> {
    const params = new HttpParams()
    .set('idSoggetto', idSoggetto.toString())
    .set('idAttivita', idAttivita.toString());
    return this.http.get<boolean>(this.constants.BasePath()+'/User/CheckFavorite', { params });
}
}
