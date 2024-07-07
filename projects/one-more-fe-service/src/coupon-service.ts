import { Coupon, StatusCouponUser } from './EntityInterface/Coupon';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CouponListDto } from './EntityInterface/CouponListDto.cjs';


@Injectable({
  providedIn: 'root'
})
export class CouponService {

  coupon !: Coupon;

  constructor(private http:HttpClient) { }

  AddCoupon(coupon : Coupon): Observable<any>{
    return this.http.post<Coupon>('https://localhost:7253/Coupon/Add', coupon);
  }

  ListCoupon(idSogetto: number): Observable<any>{
    return this.http.get<CouponListDto[]>('https://localhost:7253/Coupon/List?idSoggetto='+idSogetto);
  }

  UpdateCoupon(undoCoupon : StatusCouponUser){
    return this.http.put<StatusCouponUser>('https://localhost:7253/Coupon/Update',undoCoupon );
  }

  UndoCoupon(undoCoupon : StatusCouponUser){
    return this.http.put<StatusCouponUser>('https://localhost:7253/Coupon/Update',undoCoupon );
  }
}
