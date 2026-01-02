import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Observable } from "rxjs";
import { ShopAddResDto } from "../Dtos/Responses/shops/ShopAddResDto";
import { ShopListDto } from "../Dtos/Responses/shops/ShopListDto";
import { ShopAddReqDto } from "../Dtos/Requests/shops/ShopAddReqDto";
import { ShopDetailResDto } from "../Dtos/Responses/shops/ShopDetailResDto";
import { ShopUpdateReqDto } from "../Dtos/Requests/shops/ShopUpdateReqDto";
import { ShopUpdateResDto } from "../Dtos/Responses/shops/ShopUpdateResDto";

@Injectable({
    providedIn: 'root'
})
export class ShopApiService {

    language: string | undefined;
    constructor(private http: HttpClient,
        private constants: Constants,) { }

    Get(shopId: number): Observable<ShopDetailResDto> {
        return this.http.get<ShopDetailResDto>(this.constants.BasePath() + '/shop/get?shopId=' + shopId);
    }

    Add(shopAddReqDto: ShopAddReqDto): Observable<ShopAddResDto> {
        return this.http.post<ShopAddResDto>(this.constants.BasePath() + '/shop/add', shopAddReqDto);
    }
    Update(shopUpdateReqDto: ShopUpdateReqDto): Observable<ShopUpdateResDto> {
        return this.http.put<ShopUpdateResDto>(this.constants.BasePath() + '/shop/update', shopUpdateReqDto);
    }

    List(): Observable<ShopListDto[]> {
        return this.http.get<ShopListDto[]>(this.constants.BasePath() + '/shop/list');
    }
}
