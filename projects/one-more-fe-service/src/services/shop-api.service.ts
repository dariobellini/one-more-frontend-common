import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { firstValueFrom, Observable } from "rxjs";
import { ShopRecDetailDto } from "../Dtos/Requests/ShopRecDetailDto";
import { ShopAddReqDto } from "../Dtos/Requests/ShopAddReqDto";
import { ShopAddResDto } from "../Dtos/Responses/ShopAddResDto";
import { ShopListDto } from "../Dtos/Responses/ShopListDto";

@Injectable({
    providedIn: 'root'
})
export class ShopApiService {

    language: string | undefined;
    constructor(private http: HttpClient,
        private constants: Constants,) { }

    async Get(shopId: number): Promise<ShopRecDetailDto> {
        return await firstValueFrom(this.http.get<ShopRecDetailDto>(this.constants.BasePath() + '/shop/get?shopId=' + shopId));
    }

    Add(shopAddReqDto: ShopAddReqDto): Observable<ShopAddResDto> {
        return this.http.post<ShopAddResDto>(this.constants.BasePath() + '/shop/add', shopAddReqDto);
    }

    List(): Observable<ShopListDto[]> {
        return this.http.get<ShopListDto[]>(this.constants.BasePath() + '/shop/list');
    }
}
