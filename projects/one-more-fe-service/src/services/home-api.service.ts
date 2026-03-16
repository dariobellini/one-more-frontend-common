import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Observable } from "rxjs";
import { ShopListResDto } from "../Dtos/Responses/shops/ShopListResDto";
import { PromoListResDto } from "../Dtos/Responses/promos/PromoListResDto";
import { SearchResDto } from "../Dtos/Responses/search/SearchResDto";
@Injectable({
    providedIn: 'root'
})
export class HomeApiService {

    language: string | undefined;

    http = inject(HttpClient);
    constants = inject(Constants);
    constructor() { }


    PromosByType(promoTypeId: number): Observable<SearchResDto> {
        return this.http.get<SearchResDto>(this.constants.BasePath() + '/home/promos-by-type?promoTypeId=' + promoTypeId);
    }

    ShopsByType(ShopTypeId: number): Observable<SearchResDto> {
        return this.http.get<SearchResDto>(this.constants.BasePath() + '/home/shops-by-type?shopTypeId=' + ShopTypeId);
    }

    PromosByCategory(promoCategoryId: number): Observable<PromoListResDto> {
        return this.http.get<PromoListResDto>(this.constants.BasePath() + '/home/promos-by-category?promoCategoryId=' + promoCategoryId);
    }

    ShopsByCategory(promoCategoryId: number): Observable<ShopListResDto> {
        return this.http.get<ShopListResDto>(this.constants.BasePath() + '/home/shops-by-category?promoCategoryId=' + promoCategoryId);
    }

    NewEntries(): Observable<ShopListResDto> {
        return this.http.get<ShopListResDto>(this.constants.BasePath() + '/home/new-entries');
    }
    Nearby(): Observable<ShopListResDto> {
        return this.http.get<ShopListResDto>(this.constants.BasePath() + '/home/nearby');
    }
    RecentViews(): Observable<ShopListResDto> {
        return this.http.get<ShopListResDto>(this.constants.BasePath() + '/home/recent-views');
    }
}
