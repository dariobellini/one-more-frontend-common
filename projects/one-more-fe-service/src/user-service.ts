import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from './Constants';
import { firstValueFrom } from 'rxjs';
import { DeleteReasonDto } from './Dtos/DeleteReasonDto';
import { CommonResDto } from './Dtos/Responses/CommonResDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  http = inject(HttpClient);
  constants = inject(Constants);

  constructor() { }

  updateShopRecentView(shopId: number): Observable<any> {
    return this.http.post(
      `${this.constants.BasePath()}/user/update-shop-recent-view?shopId=${shopId}`,
      null
    );
  }

  ListDeleteReasons(): Observable<DeleteReasonDto[]> {
      return this.http.get<DeleteReasonDto[]>(this.constants.BasePath() + '/user/get-reason-user-delete');
  }
}
