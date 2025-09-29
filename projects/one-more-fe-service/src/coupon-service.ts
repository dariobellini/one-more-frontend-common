import { Coupon, StatusCoupon, StatusCouponUser } from './EntityInterface/Coupon';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CouponListDto } from './EntityInterface/CouponListDto.cjs';
import { Constants } from './Constants';
import { AuthService } from './Auth/auth.service';
import { InsertCouponResponse } from './EntityInterface/Promo';
import { ValidaCouponEsitoDto } from './EntityInterface/CouponDto/ValidaCouponEsitoDto';


@Injectable({
  providedIn: 'root'
})
export class CouponService {

  coupon !: Coupon;

  language: string | undefined;
  constructor(private http: HttpClient, private constants: Constants,
    private authService: AuthService) { }

  AddCoupon(coupon: Coupon): Observable<InsertCouponResponse> {
    return this.http.post<InsertCouponResponse>(
      `${this.constants.BasePath()}/Coupon/Add`,
      coupon
    );
  }

  ListCoupon(): Observable<any> {
    this.language = this.authService.getLanguageSession();
    return this.http.get<CouponListDto[]>(this.constants.BasePath() + '/Coupon/List?lang=' + this.language.toUpperCase());
  }

  UpdateCoupon(coupon: StatusCoupon): Observable<any> {
    return this.http.put<StatusCoupon>(this.constants.BasePath() + '/Coupon/Update', coupon);
  }

  Validate(jwtCoupon: string): Observable<ValidaCouponEsitoDto> {
    return this.http.post<ValidaCouponEsitoDto>(this.constants.BasePath() + '/Coupon/Validate', jwtCoupon);
  }
}
