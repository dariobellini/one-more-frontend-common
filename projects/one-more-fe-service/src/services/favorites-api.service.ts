import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Observable, tap } from "rxjs";
import { CommonResDto } from "../Dtos/Responses/CommonResDto";
import { FavoritesRedDto } from "../Dtos/Responses/favorites/FavoritesResDto";
import { ShopListResDto } from "../Dtos/Responses/shops/ShopListResDto";
import { AddRemoveFavoriteReqDto } from "../Dtos/Requests/favorites/AddRemoveFavoriteReqDto";
import { CacheStorageService } from "./cache-storage.service";

@Injectable({
    providedIn: 'root'
})
export class FavoritesApiService {

    private readonly FAVORITES_KEY = 'user_favorites';
    private readonly FAVORITES_CATEGORY = 'user-data'; // Categoria per organizzare i dati
    private cachedFavorites: number[] | null = null;
    
    http = inject(HttpClient);
    constants = inject(Constants);
    cacheService = inject(CacheStorageService); // ✅ Rinominato per chiarezza
    
    constructor() { }

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
                    const favoriteObs = await this. Favorite();
                    favoriteObs.subscribe();
                }
            })
        );
    }

    async Favorite(): Promise<Observable<FavoritesRedDto>> {
        return this.http.get<FavoritesRedDto>(
            this.constants. BasePath() + '/favorites/get'
        ).pipe(
            tap(async (response) => {
                if (response.outcome && response.shopIds) {
                    // ✅ Salva usando il nuovo CacheStorageService
                    await this.cacheService.setJSON(
                        this.FAVORITES_KEY, 
                        response.shopIds,
                        {
                            category: this. FAVORITES_CATEGORY,
                            ttl: 0 // Nessuna scadenza (persiste fino a logout)
                        }
                    );
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

    // ✅ Metodo helper per ottenere i preferiti dalla sessione
    async getFavoritesFromSession(): Promise<number[] | null> {
        // Se è già in memoria, ritorna subito
        if (this.cachedFavorites !== null) {
            return this.cachedFavorites;
        }
        
        // Altrimenti recupera dalla cache
        const favorites = await this. cacheService.getJSON<number[]>(
            this. FAVORITES_KEY,
            this.FAVORITES_CATEGORY
        );
        
        this.cachedFavorites = favorites;
        return favorites;
    }

    // ✅ Metodo helper per verificare se uno shop è tra i preferiti
    async isFavorite(shopId: number): Promise<boolean> {
        const favorites = await this.getFavoritesFromSession();
        return favorites ? favorites.includes(shopId) : false;
    }

    // ✅ Metodo per pulire la cache (utile al logout)
    async clearCache(): Promise<void> {
        this.cachedFavorites = null;
        await this.cacheService.remove(this.FAVORITES_KEY, this.FAVORITES_CATEGORY);
    }
}