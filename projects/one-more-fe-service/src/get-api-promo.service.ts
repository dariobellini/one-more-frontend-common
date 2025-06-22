import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { InsertPromoReqDto, InsertPromoUserAttiva, Promo } from './EntityInterface/Promo';
import { Constants } from './Constants';
import { AuthService } from './Auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetApiPromoService {

  promo !: Promo;
  promoData !: Promo;
  language : string | undefined;
  
  constructor(private http:HttpClient, private constants: Constants, private authService: AuthService) { }

  setPromoData(promo: Promo) {
    this.promoData = promo;
  }

  getPromoData(): Promo {
    return this.promoData;
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

  apiGetListaPromoByIdAttivitaAndUser(id: number, idSoggetto: number): Observable<Promo[]> {
    const lang = this.authService.getLanguageSession() || 'IT'; // Recupera la lingua

    const params = new HttpParams()
        .set('idAttivita', id.toString())
        .set('idSoggetto', idSoggetto.toString())
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

  async apiInsertPromo(promo: InsertPromoReqDto): Promise<any> {
    const lang = this.authService.getLanguageSession() || 'IT'; 
    return await firstValueFrom(
      this.http.post<any>(this.constants.BasePath() + `/Promo/insert-promo`,promo, {params: {
        lang: lang.toUpperCase(),
    }
  }));
  }
  
  async apiInsertPromoAttiva(promo: InsertPromoUserAttiva): Promise<any> {
    return await firstValueFrom(
      this.http.post<any>(this.constants.BasePath() + `/Promo/insert-promo-user-attiva`, promo)
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
