import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Constants } from "../Constants";
import { Observable, from, of, switchMap, tap, map } from "rxjs";
import { CommonResDto } from "../Dtos/Responses/CommonResDto";
import { FavoritesRedDto } from "../Dtos/Responses/favorites/FavoritesResDto";
import { ShopListResDto } from "../Dtos/Responses/shops/ShopListResDto";
import { AddRemoveFavoriteReqDto } from "../Dtos/Requests/favorites/AddRemoveFavoriteReqDto";
import { CacheServiceV2 } from "./cache-storage.service";

@Injectable({ providedIn: 'root' })
export class FavoritesApiService {
  private readonly FAVORITES_KEY = 'user_favorites';
  private readonly FAVORITES_CATEGORY = 'user-data';

  private cachedFavorites: number[] | null = null;

  private http = inject(HttpClient);
  private constants = inject(Constants);
  private cache = inject(CacheServiceV2);

  /** Toggle preferito e poi ricarica lista preferiti (e cache) */
  AddRemove(idShop: number): Observable<CommonResDto> {
    const request: AddRemoveFavoriteReqDto = { shopId: idShop };

    return this.http
      .post<CommonResDto>(this.constants.BasePath() + '/favorites/add-remove', request).pipe(
        switchMap(res => {
          if (!res.outcome) return of(res);
          return this.Favorite().pipe(map(() => res));
        })
      );
  }

  /** Chiama API e aggiorna cache + memoria */
  Favorite(): Observable<FavoritesRedDto> {
    return this.http.get<FavoritesRedDto>(this.constants.BasePath() + '/favorites/get').pipe(
        tap(res => {
          if (res.outcome && res.shopIds) {
            this.cachedFavorites = res.shopIds;
            void this.cache.set(this.FAVORITES_KEY, res.shopIds, {
              category: this.FAVORITES_CATEGORY,
              ttlMs: 0,
              type: 'json',
            });
          }
        })
      );
  }

  Shops(): Observable<ShopListResDto> {
    return this.http.get<ShopListResDto>(this.constants.BasePath() + '/favorites/shops');
  }

  /** Preferiti “session”: prima memoria, poi cache */
  getFavoritesFromSession(): Observable<number[] | null> {
    if (this.cachedFavorites !== null) return of(this.cachedFavorites);

    return from(
      this.cache.get<number[]>(this.FAVORITES_KEY, { category: this.FAVORITES_CATEGORY })
    ).pipe(
      tap(favs => (this.cachedFavorites = favs)),
      map(favs => favs ?? null)
    );
  }

  isFavorite(shopId: number): Observable<boolean> {
    return this.getFavoritesFromSession().pipe(
      map(favs => (favs ? favs.includes(shopId) : false))
    );
  }

  clearCache(): Promise<void> {
    this.cachedFavorites = null;
    return this.cache.remove(this.FAVORITES_KEY, { category: this.FAVORITES_CATEGORY });
  }
}