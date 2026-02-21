import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Observable } from "rxjs";
import { ShopAddResDto } from "../Dtos/Responses/shops/ShopAddResDto";
import { ShopListDto } from "../Dtos/Responses/shops/ShopListDto";
import { ShopAddReqDto } from "../Dtos/Requests/shops/ShopAddReqDto";
import { ShopDetailResDto } from "../Dtos/Responses/shops/ShopDetailResDto";
import { ShopUpdateReqDto } from "../Dtos/Requests/shops/ShopUpdateReqDto";
import { ShopUpdateResDto } from "../Dtos/Responses/shops/ShopUpdateResDto";
import { DeleteReasonDto } from "../Dtos/DeleteReasonDto";
import { CommonResDto } from "../Dtos/Responses/CommonResDto";

@Injectable({
    providedIn: 'root'
})
export class ShopApiService {

    language: string | undefined;
    http = inject(HttpClient);
    constants = inject(Constants);
    
    constructor() { }

    Get(shopId: number): Observable<ShopDetailResDto> {
        return this.http.get<ShopDetailResDto>(this.constants.BasePath() + '/shop/get?shopId=' + shopId);
    }

    Add(shopAddReqDto: ShopAddReqDto): Observable<ShopAddResDto> {
        console.log('ShopAddReqDto:', shopAddReqDto);
        return this.http.post<ShopAddResDto>(this.constants.BasePath() + '/shop/add', shopAddReqDto);
    }
    Update(shopUpdateReqDto: ShopUpdateReqDto): Observable<ShopUpdateResDto> {
        return this.http.put<ShopUpdateResDto>(this.constants.BasePath() + '/shop/update', shopUpdateReqDto);
    }

    List(): Observable<ShopListDto[]> {
        return this.http.get<ShopListDto[]>(this.constants.BasePath() + '/shop/list');
    }

    ListDeleteReasons(): Observable<DeleteReasonDto[]> {
        return this.http.get<DeleteReasonDto[]>(this.constants.BasePath() + '/shop/get-reason-shop-delete');
    }

    Delete(shopId: number, idReason: number): Observable<CommonResDto> {
    const params = new HttpParams()
      .set('shopId', shopId)
      .set('idReason', idReason);

    return this.http.delete<CommonResDto>(this.constants.BasePath() + '/shop/delete', { params });
  }
}
