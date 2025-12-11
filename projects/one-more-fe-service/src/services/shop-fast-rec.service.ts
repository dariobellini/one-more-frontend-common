import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { firstValueFrom, Observable } from "rxjs";
import { LanguageService } from "./language.service";
import { ShopFastRecResListDto } from "../Dtos/Responses/shops-fast-rec/ShopFastRecListResDto";
import { ShopRecDetailDto } from "../Dtos/Requests/shops/ShopRecDetailDto";
import { ShopFastRecReqDto } from "../Dtos/Requests/shops-fast-rec/ShopFastRecReqDto";

@Injectable({
    providedIn: 'root'
})
export class ShopFastRecService {

    language: string | undefined;
    http = inject(HttpClient);
    constants = inject(Constants)
    languageService = inject(LanguageService);

    constructor() { }

    async List(datiAttivita: ShopFastRecReqDto): Promise<ShopFastRecResListDto[]> {
        this.language = this.languageService.getLanguageSession();
        return await firstValueFrom(
            this.http.get<ShopFastRecResListDto[]>(this.constants.BasePath() + '/shopfastrec/list', {
                params: {
                    nome: datiAttivita.nome || '',
                    citta: datiAttivita.citta || '',
                    indirizzo: datiAttivita.indirizzo || '',
                    lang: this.language || 'IT'
                }
            })
        );
    }

    Detail(placeId:string): Observable<ShopRecDetailDto> {
        return this.http.get<ShopRecDetailDto>(this.constants.BasePath() + '/shopfastrec/detail', {params: {placeId: placeId}});
    }
}
