import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from './Constants';
import { SearchItemDto } from './EntityInterface/SearchItemDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SearchApiService {
  constructor(private http:HttpClient, private constants:Constants) { }

  async Search(input:string): Promise<Observable<SearchItemDto[]>> {
    return this.http.get<SearchItemDto[]>(this.constants.BasePath() + '/search/aux-search?input='+input);
  }

}


