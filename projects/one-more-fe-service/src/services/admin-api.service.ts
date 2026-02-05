import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Constants } from '../Constants';
import { AdminCheckReasonsResDto } from '../Dtos/admin/AdminCheckReasonsResDto';
import { ShopsToCheckResDto } from '../Dtos/admin/ShopsToCheckResDto';
import { CheckShopReqDto } from '../Dtos/admin/CheckShopReqDto';
import { CommonResDto } from '../Dtos/Responses/CommonResDto';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {

  http = inject(HttpClient);
  constants = inject(Constants);

  constructor() {}

  /**
   * Recupera la lista delle ragioni di rifiuto
   */
  getReasons(): Observable<AdminCheckReasonsResDto> {
    return this.http.get<AdminCheckReasonsResDto>(
      `${this.constants.BasePath()}/Admin/reasons`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204) {
          return { outcome: true, description: 'No content', reasons: [] };
        }
        return response.body!;
      })
    );
  }

  /**
   * Recupera la lista degli shop da controllare
   */
  getShopsToCheck(): Observable<ShopsToCheckResDto> {
    return this.http.get<ShopsToCheckResDto>(
      `${this.constants.BasePath()}/Admin/shops`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204) {
          return { outcome: true, description: 'No content', shops: [] };
        }
        return response.body!;
      })
    );
  }

  /**
   * Invia il controllo di uno shop con testi e foto promosse/rifiutate
   * @param checkShop Dati del controllo dello shop
   */
  checkShop(checkShop: CheckShopReqDto): Observable<CommonResDto> {
    return this.http.post<CommonResDto>(
      `${this.constants.BasePath()}/Admin/shop`,
      checkShop,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204) {
          return { outcome: true, description: 'Operazione completata con successo' };
        }
        return response.body!;
      })
    );
  }
}
