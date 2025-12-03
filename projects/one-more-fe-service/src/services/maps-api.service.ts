import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';
import { ShopListResDto } from '../Dtos/Responses/shops/ShopListResDto';

@Injectable({
  providedIn: 'root'
})
export class MapsApiService {
  constructor(private http: HttpClient, private constants: Constants) {}

  /**
   * Recupera la lista degli shop per la mappa
   * @param latitude Latitudine della posizione corrente
   * @param longitude Longitudine della posizione corrente
   */
  Get(latitude: number, longitude: number): Observable<ShopListResDto> {
    return this.http.get<ShopListResDto>(
      `${this.constants.BasePath()}/maps/get?latitude=${latitude}&longitude=${longitude}`
    );
  }
}