import { Coupon, StatusCoupon, StatusCouponUser } from './EntityInterface/Coupon';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CouponListDto } from './EntityInterface/CouponListDto.cjs';
import { Constants } from './Constants';


@Injectable({
  providedIn: 'root'
})
export class CouponService {

  coupon !: Coupon;

  constructor(private http:HttpClient, private constants: Constants) { }

  AddCoupon(coupon : Coupon): Observable<any>{
    return this.http.post<Coupon>(this.constants.BasePath()+'/Coupon/Add', coupon);
  }

  ListCoupon(idSogetto: number): Observable<any>{
    return this.http.get<CouponListDto[]>(this.constants.BasePath()+'/Coupon/List?idSoggetto='+idSogetto);
  }

  UpdateCoupon(coupon : StatusCoupon): Observable<any>{
    return this.http.put<StatusCoupon>(this.constants.BasePath()+'/Coupon/Update',coupon );
  }
}
