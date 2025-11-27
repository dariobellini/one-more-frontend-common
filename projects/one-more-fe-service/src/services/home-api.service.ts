import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { firstValueFrom, Observable } from "rxjs";
import { ShopListResDto } from "../Dtos/Responses/shops/ShopListResDto";
import { PromoListDto } from "../Dtos/PromoListDto";
import { PromoListResDto } from "../Dtos/Responses/promos/PromoListResDto";

@Injectable({
    providedIn: 'root'
})
export class HomeApiService {

    language: string | undefined;
    constructor(private http: HttpClient,
        private constants: Constants,) { }


    PromosByType(promoTypeId: number): Observable<PromoListResDto> {
        console.log("PromosByType");
        return this.http.get<PromoListResDto>(this.constants.BasePath() + '/home/promos-by-type?promoTypeId=' + promoTypeId);
    }

    PromosByCategory(promoCategoryId: number): Observable<PromoListResDto> {
        return this.http.get<PromoListResDto>(this.constants.BasePath() + '/home/promos-by-category?promoCategoryId=' + promoCategoryId);
    }

    ShopsByType(promoTypeId: number): Observable<ShopListResDto> {
        return this.http.get<ShopListResDto>(this.constants.BasePath() + '/home/shops-by-type?promoTypeId=' + promoTypeId);
    }

    ShopsByCategory(promoCategoryId: number): Observable<ShopListResDto> {
        return this.http.get<ShopListResDto>(this.constants.BasePath() + '/home/shops-by-category?promoCategoryId=' + promoCategoryId);
    }

    NewEntries(): Observable<ShopListResDto> {
        return this.http.get<ShopListResDto>(this.constants.BasePath() + '/home/new-entries');
    }
}
