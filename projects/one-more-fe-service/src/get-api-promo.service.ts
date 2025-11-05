import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { EsitoInsertPromo, InsertPromoReqDto, InsertPromoUserAttiva, Promo } from './EntityInterface/Promo';
import { Constants } from './Constants';
import { firstValueFrom } from 'rxjs';
import { TipoPeriodo } from './EntityInterface/TipoPeriodo';
import { NewAuthService } from './Auth/new-auth.service';

@Injectable({
  providedIn: 'root'
})
export class GetApiPromoService {

  promo !: Promo;
  promoData !: Promo;
  language : string | undefined;
  
  constructor(private http:HttpClient, private constants: Constants, private authService: NewAuthService) { }

  setPromoData(promo: Promo) {
    this.promoData = promo;
  }

  getPromoData(): Promo {
    return this.promoData;
  }
async apiGetListaTipoPeriodo(): Promise<TipoPeriodo[]>{
    this.language = this.authService.getLanguageSession();
    if (!this.language) {
        this.language = "it";
    }
    return await firstValueFrom(
      this.http.get<TipoPeriodo[]>(this.constants.BasePath() + '/Promo/get-tipi-periodo', {
          params: {
              lang: this.language.toUpperCase()
          }
      })
    );
  }

  async apiGetListaPromoByIdAttivita(idAttivita:number): Promise<Promo[]>{
    this.language = this.authService.getLanguageSession();
    if (!this.language) {
        this.language = "it";
    }
    return await firstValueFrom(
      this.http.get<Promo[]>(this.constants.BasePath() + '/Promo/get-promo-attive-by-idattivita', {
          params: {
              idAttivita: idAttivita?.toString() || '',
              lang: this.language.toUpperCase()
          }
      })
    );
  }

  apiGetListaPromoByIdAttivitaAndUser(id: number): Observable<Promo[]> {
    const lang = this.authService.getLanguageSession() || 'IT'; // Recupera la lingua

    const params = new HttpParams()
        .set('idAttivita', id.toString())
        .set('lang', lang.toUpperCase());

    return this.http.get<Promo[]>(this.constants.BasePath() + '/Promo/get-promo-attive-by-idattivita-user', { params });
}

  async apiDeletePromoByIdPromo(idPromo: number | undefined, idAttivita: number | undefined): Promise<number> {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  const url = `${this.constants.BasePath()}/Promo/delete-promo-by-idpromo?idAttivita=${idAttivita}&idPromo=${idPromo}`;

  return await firstValueFrom(
    this.http.post<number>(url, null, httpOptions)
  );
}

  async apiInsertPromo(promo: InsertPromoReqDto): Promise<EsitoInsertPromo> {
    const lang = this.authService.getLanguageSession() || 'IT';

    return await firstValueFrom(
      this.http.post<EsitoInsertPromo>(
        `${this.constants.BasePath()}/Promo/insert-promo`,
        promo, {
          params: { lang: lang.toUpperCase() }
        }
      )
    );
  }
  
  async apiUpdatePromo(promo: InsertPromoReqDto): Promise<any> {
    const lang = this.authService.getLanguageSession() || 'IT';
    return await firstValueFrom(
      this.http.post<any>(this.constants.BasePath() + `/Promo/update-promo`, promo, {params: {
        lang: lang.toUpperCase(),
    }
  }));
  }
}
