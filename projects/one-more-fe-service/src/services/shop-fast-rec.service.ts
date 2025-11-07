import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { firstValueFrom } from "rxjs";
import { LanguageService } from "./language.service";
import { ReqAttivitaAutocomplete } from "../EntityInterface/Attivita";
import { ShopRecDetailDto } from "../Dtos/ShopRecDetailDto";
import { ShopFastRecListDto } from "../Dtos/ShopFastRecListDto";

@Injectable({
    providedIn: 'root'
})
export class ShopFastRecService {

    language: string | undefined;
    constructor(private http: HttpClient,
        private constants: Constants,
        private languageService: LanguageService) { }

    async List(datiAttivita: ReqAttivitaAutocomplete): Promise<ShopFastRecListDto[]> {
        this.language = this.languageService.getLanguageSession();
        return await firstValueFrom(
            this.http.get<ShopFastRecListDto[]>(this.constants.BasePath() + '/shopfastrec/list', {
                params: {
                    nome: datiAttivita.nome || '',
                    citta: datiAttivita.citta || '',
                    indirizzo: datiAttivita.indirizzo || '',
                    lang: this.language || 'IT'
                }
            })
        );
    }

    async Detail(placeId:string): Promise<ShopRecDetailDto> {
        return await firstValueFrom(this.http.get<ShopRecDetailDto>(this.constants.BasePath() + '/shopfastrec/detail', {params: {placeId: placeId}}));
    }
}
