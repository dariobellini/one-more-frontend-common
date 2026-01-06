import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Coupon, StatusCoupon } from "../EntityInterface/Coupon";
import { InsertCouponResponse } from "../EntityInterface/Promo";
import { firstValueFrom, Observable } from "rxjs";
import { LanguageService } from "./language.service";
import { CouponListDto } from "../EntityInterface/CouponListDto.cjs";
import { ValidaCouponEsitoDto } from "../EntityInterface/CouponDto/ValidaCouponEsitoDto";
import { CanRedeemResDto } from "../Dtos/Responses/coupons/CanRedeemResDto";

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  coupon !: Coupon;
  http = inject(HttpClient);
  constants = inject(Constants);
  languageService = inject(LanguageService);
  language: string | undefined;
  constructor() { }

  AddCoupon(coupon: Coupon): Observable<InsertCouponResponse> {
    return this.http.post<InsertCouponResponse>(
      `${this.constants.BasePath()}/Coupon/Add`,
      coupon
    );
  }

  async ListCoupon(): Promise<any> {
    this.language = this.languageService.getCurrentLanguage() || 'it';
     return await firstValueFrom(
          this.http.get<CouponListDto[]>(this.constants.BasePath() + '/Coupon/List?lang='+ this.language.toUpperCase())
        );
  }

  UpdateCoupon(coupon: StatusCoupon): Observable<any> {
    return this.http.put<StatusCoupon>(this.constants.BasePath() + '/Coupon/Update', coupon);
  }

  Validate(jwtCoupon: string): Observable<ValidaCouponEsitoDto> {
    return this.http.post<ValidaCouponEsitoDto>(this.constants.BasePath() + '/Coupon/Validate', {jwtCoupon});
  }
  CanRedeem(promoId: string): Observable<CanRedeemResDto> {
    return this.http.get<CanRedeemResDto>(this.constants.BasePath() + '/Coupon/can-redeem', {params: {promoId}});
  }
}
