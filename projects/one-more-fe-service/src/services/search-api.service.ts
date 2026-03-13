import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';
import { SearchItemDto } from '../EntityInterface/SearchItemDto';
import { SearchResDto } from '../Dtos/Responses/search/SearchResDto';
import { GenericSearchReqDto } from '../Dtos/Requests/search/GenericSearchReqDto';

@Injectable({
  providedIn: 'root'
})

export class SearchApiService {
  http = inject(HttpClient);
  constants = inject(Constants);

  constructor() { }

  async PreSearch(input: string): Promise<Observable<SearchItemDto[]>> {
    return this.http.get<SearchItemDto[]>(this.constants.BasePath() + '/search/pre-search?input=' + input);
  }

  async GuidedSearch(input: SearchItemDto): Promise<Observable<SearchResDto>> {
    return this.http.post<SearchResDto>(this.constants.BasePath() + '/search/guided-search', input);
  }

  async GenericSearch(input: GenericSearchReqDto): Promise<Observable<SearchResDto>> {
    let url = this.constants.BasePath() + '/search/generic-search?query=' + input;
    return this.http.post<SearchResDto>(url, input);
  }
}
