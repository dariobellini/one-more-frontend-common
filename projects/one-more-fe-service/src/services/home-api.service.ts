import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { firstValueFrom, Observable } from "rxjs";
import { ShopRecDetailDto } from "../Dtos/Requests/shops/ShopRecDetailDto";
import { ShopAddResDto } from "../Dtos/Responses/shops/ShopAddResDto";
import { ShopListDto } from "../Dtos/Responses/shops/ShopListDto";
import { ShopAddReqDto } from "../Dtos/Requests/shops/ShopAddReqDto";
import { ShopListResDto } from "../Dtos/Responses/shops/ShopListResDto";

@Injectable({
    providedIn: 'root'
})
export class HomeApiService {

    language: string | undefined;
    constructor(private http: HttpClient,
        private constants: Constants,) { }

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
