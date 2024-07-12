import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comuni } from './EntityInterface/Comuni_CAP';
import { Constants } from './Constants';

@Injectable({
  providedIn: 'root'
})
export class GetApiComuniService {

  constructor(private http:HttpClient, private constants: Constants) { }

  apiGetListaComuni(): Observable<Comuni[]>{
    return this.http.get<Comuni[]>(this.constants.BasePath()+'/Comuni/get-comuni');
  }

}
