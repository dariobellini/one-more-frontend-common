import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Observable } from "rxjs";
import { PromoCategoryDto } from "../Dtos/PromoCategoryDto";
import { PromoTypeDto } from "../Dtos/PromoTypeDto";
import { PromoAddReqDto } from "../Dtos/Requests/promos/PromoAddReqDto";
import { PromoAddResDto } from "../Dtos/Responses/promos/PromoAddResDto";
import { PromoListResDto } from "../Dtos/Responses/promos/PromoListResDto";
import { PromoGetResDto } from "../Dtos/Responses/promos/PromoGetResDto";
import { PromoPeriodDto } from "../Dtos/PromoPeriodDto";
import { PromoAnyResDto } from "../Dtos/Responses/promos/PromoAnyResDto";
import { PromoUpdateReqDto } from "../Dtos/Requests/promos/PromoUpdateReqDto";
import { PromoUpdateResDto } from "../Dtos/Responses/promos/PromoUpdateResDto";

@Injectable({
    providedIn: 'root'
})
export class PromoApiService {

    language: string | undefined;
    http = inject(HttpClient);
    constants = inject(Constants);

    constructor() { }

    Categories(): Observable<PromoCategoryDto[]> {
        return this.http.get<PromoCategoryDto[]>(this.constants.BasePath() + '/promo/categories');
    }

    Types(): Observable<PromoTypeDto[]> {
        return this.http.get<PromoTypeDto[]>(this.constants.BasePath() + '/promo/types');
    }
    Periods(): Observable<PromoPeriodDto[]> {
        return this.http.get<PromoPeriodDto[]>(this.constants.BasePath() + '/promo/periods');
    }

    Get(promoId: number): Observable<PromoGetResDto> {
        return this.http.get<PromoGetResDto>(this.constants.BasePath() + '/promo/get?promoId=' + promoId);
    }
    
    Any(): Observable<PromoAnyResDto> {
        return this.http.get<PromoAnyResDto>(this.constants.BasePath() + '/promo/any');
    }

    Add(promoAddReqDto: PromoAddReqDto): Observable<PromoAddResDto> {
        return this.http.post<PromoAddResDto>(this.constants.BasePath() + '/promo/add', promoAddReqDto);
    }

    Update(promoUpdateReqDto: PromoUpdateReqDto): Observable<PromoUpdateResDto> {
        return this.http.put<PromoUpdateResDto>(this.constants.BasePath() + '/promo/update', promoUpdateReqDto);
    }

    List(shopId:number): Observable<PromoListResDto> {
        return this.http.get<PromoListResDto>(this.constants.BasePath() + '/promo/list?shopId=' + shopId);
    }
}
