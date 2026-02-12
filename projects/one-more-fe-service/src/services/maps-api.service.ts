import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';
import { MapResDto } from '../Dtos/Responses/map/MapResDto';

@Injectable({
  providedIn: 'root'
})
export class MapsApiService {

  http = inject(HttpClient);
  constants = inject(Constants);

  constructor() {}

  Get(latitude: number, longitude: number): Observable<MapResDto> {
    return this.http.get<MapResDto>(
      `${this.constants.BasePath()}/maps/get?latitude=${latitude}&longitude=${longitude}`
    );
  }

  GetInBounds(swLat: number, swLng: number, neLat: number, neLng: number): Observable<MapResDto> {
    const params = {
      latitude: '0', // non usato quando ci sono i bounds, ma il param è richiesto
      longitude: '0',
      swLat: swLat.toString(),
      swLng: swLng.toString(),
      neLat: neLat.toString(),
      neLng: neLng.toString()
    };

    return this.http.get<MapResDto>(`${this.constants.BasePath()}/maps/get-in-bounds`, { params });
  }
}