import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Observable, tap } from "rxjs";
import { CommonResDto } from "../Dtos/Responses/CommonResDto";
import { FavoritesRedDto } from "../Dtos/Responses/favorites/FavoritesResDto";
import { ShopListResDto } from "../Dtos/Responses/shops/ShopListResDto";
import { AddRemoveFavoriteReqDto } from "../Dtos/Requests/favorites/AddRemoveFavoriteReqDto";
import { StorageService } from "../storage.service";

@Injectable({
    providedIn: 'root'
})
export class FavoritesApiService {

    private readonly FAVORITES_KEY = 'user_favorites';
    private cachedFavorites: number[] | null = null;

    constructor(
        private http: HttpClient,
        private constants: Constants,
        private storageService: StorageService
    ) { }

    async AddRemove(idShop: number): Promise<Observable<CommonResDto>> {
        const request: AddRemoveFavoriteReqDto = {
            shopId: idShop
        };

        return this.http.post<CommonResDto>(
            this.constants.BasePath() + '/favorites/add-remove',
            request
        ).pipe(
            tap(async (response) => {
                if (response.outcome) {
                    // Richiama Favorite per aggiornare la sessione
                    const favoriteObs = await this.Favorite();
                    favoriteObs.subscribe();
                }
            })
        );
    }

    async Favorite(): Promise<Observable<FavoritesRedDto>> {
        return this.http.get<FavoritesRedDto>(
            this.constants.BasePath() + '/favorites/get'
        ).pipe(
            tap(async (response) => {
                if (response.outcome && response.shopIds) {
                    // Salva in sessione
                    await this.storageService.setItem(this.FAVORITES_KEY, response.shopIds);
                    this.cachedFavorites = response.shopIds;
                }
            })
        );
    }

    Shops(): Observable<ShopListResDto> {
        return this.http.get<ShopListResDto>(
            this.constants.BasePath() + '/favorites/shops'
        );
    }

    // Metodo helper per ottenere i preferiti dalla sessione
    async getFavoritesFromSession(): Promise<number[] | null> {
        if (this.cachedFavorites !== null) {
            return this.cachedFavorites;
        }
        const favorites = await this.storageService.getItem(this.FAVORITES_KEY);
        this.cachedFavorites = favorites;
        return favorites;
    }

    // Metodo helper per verificare se uno shop è tra i preferiti
    async isFavorite(shopId: number): Promise<boolean> {
        const favorites = await this.getFavoritesFromSession();
        return favorites ? favorites.includes(shopId) : false;
    }

    // Metodo per pulire la cache
    clearCache(): void {
        this.cachedFavorites = null;
    }
}
