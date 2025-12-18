import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';
import { CouponAddReqDto } from '../Dtos/Requests/coupons/CouponAddReqDto';
import { CouponListResDto } from '../Dtos/Responses/coupons/CouponListResDto';
import { CouponDetailResDto } from '../Dtos/Responses/coupons/CouponDetailResDto';
import { CouponAddResDto } from '../Dtos/Responses/coupons/CouponAddResDto';
import { CouponUseReqDto } from '../Dtos/Requests/coupons/CouponUseReqDto';
import { CouponUseResDto } from '../Dtos/Responses/coupons/CouponUseResDto';

@Injectable({
  providedIn: 'root'
})
export class CouponApiService {

  http = inject(HttpClient);
  constants = inject(Constants);

  constructor() {}

  /**
   * Recupera la lista dei coupon dell'utente
   */
  List(): Observable<CouponListResDto> {
    return this.http.get<CouponListResDto>(
      `${this.constants.BasePath()}/Coupon/List`
    );
  }

  /**
   * Recupera il dettaglio di un coupon specifico
   * @param id ID del coupon
   */
  Get(id: number): Observable<CouponDetailResDto> {
    return this.http.get<CouponDetailResDto>(
      `${this.constants.BasePath()}/Coupon/Get/${id}`
    );
  }

  /**
   * Crea un nuovo coupon
   * @param coupon Dati del coupon da creare
   */
  Create(coupon: CouponAddReqDto): Observable<CouponAddResDto> {
    return this.http.post<CouponAddResDto>(
      `${this.constants.BasePath()}/Coupon/Add`,
      coupon
    );
  }

  //TODO; implementare CouponUpdate
  /**
   * Aggiorna un coupon esistente
   * @param id ID del coupon
   * @param coupon Dati del coupon da aggiornare
   */
  Update(id: number, coupon: any): Observable<any> {
    return this.http.put<any>(
      `${this.constants.BasePath()}/Coupon/Update/${id}`,
      coupon
    );
  }

  /**
   * Elimina un coupon
   * @param id ID del coupon da eliminare
   */
  Delete(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.constants.BasePath()}/Coupon/Delete/${id}`
    );
  }

  /**
   * Valida un coupon tramite JWT
   * @param jwtCoupon Token JWT del coupon
   */
  Use(req: CouponUseReqDto): Observable<CouponUseResDto> {
    return this.http.post<CouponUseResDto>(
      `${this.constants.BasePath()}/Coupon/Validate`,
      req
    );
  }
}
