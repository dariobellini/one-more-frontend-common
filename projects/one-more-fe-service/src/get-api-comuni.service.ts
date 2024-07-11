import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comuni } from './EntityInterface/Comuni_CAP';

@Injectable({
  providedIn: 'root'
})
export class GetApiComuniService {

  constructor(private http:HttpClient) { }

  apiGetListaComuni(): Observable<Comuni[]>{
    return this.http.get<Comuni[]>('https://localhost:7253/Comuni/get-comuni');
  }

}
