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

  updateShopRecentView(shopId: number): Observable<any> {
    return this.http.post(
      `${this.constants.BasePath()}/user/update-shop-recent-view?shopId=${shopId}`,
      null
    );
  }

}
