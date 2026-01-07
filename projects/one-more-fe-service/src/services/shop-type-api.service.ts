import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { firstValueFrom } from "rxjs";
import { ShopTypeDto } from "../Dtos/ShopTypeDto";

@Injectable({
    providedIn: 'root'
})
export class ShopTypeApiService {

    language: string | undefined;
    http = inject(HttpClient);
    constants = inject(Constants); 

    constructor() { }

    async List(): Promise<ShopTypeDto[]> {
        return await firstValueFrom(this.http.get<ShopTypeDto[]>(this.constants.BasePath() + '/shoptype/list'));
    }
}
