import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Observable } from "rxjs";
import { PromoCategoryDto } from "../Dtos/PromoCategoryDto";
import { PromoTypeDto } from "../Dtos/PromoTypeDto";
import { PromoAddReqDto } from "../Dtos/Requests/promos/PromoAddReqDto";
import { PromoAddResDto } from "../Dtos/Responses/promos/PromoAddResDto";
import { PromoListResDto } from "../Dtos/Responses/promos/PromoListResDto";
import { PromoGetResDto } from "../Dtos/Responses/promos/PromoGetResDto";

@Injectable({
    providedIn: 'root'
})
export class PromoApiService {

    language: string | undefined;
    constructor(private http: HttpClient,
        private constants: Constants,) { }

    Categories(): Observable<PromoCategoryDto[]> {
        return this.http.get<PromoCategoryDto[]>(this.constants.BasePath() + '/promo/categories');
    }

    Types(): Observable<PromoTypeDto[]> {
        return this.http.get<PromoTypeDto[]>(this.constants.BasePath() + '/promo/types');
    }

    Get(promoId: number): Observable<PromoGetResDto> {
        return this.http.get<PromoGetResDto>(this.constants.BasePath() + '/promo/get?promoId=' + promoId);
    }

    Add(promoAddReqDto: PromoAddReqDto): Observable<PromoAddResDto> {
        return this.http.post<PromoAddResDto>(this.constants.BasePath() + '/promo/add', promoAddReqDto);
    }

    List(shopId:number): Observable<PromoListResDto> {
        return this.http.get<PromoListResDto>(this.constants.BasePath() + '/promo/list?shopId=' + shopId);
    }
}
