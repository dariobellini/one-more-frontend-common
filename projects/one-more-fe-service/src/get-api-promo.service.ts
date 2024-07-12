import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { InsertPromoReqDto, InsertPromoUserAttiva, Promo } from './EntityInterface/Promo';
import { Constants } from './Constants';


@Injectable({
  providedIn: 'root'
})
export class GetApiPromoService {

  promo !: Promo;
  promoData !: Promo;
  
  constructor(private http:HttpClient, private constants: Constants) { }

  setPromoData(promo: Promo) {
    this.promoData = promo;
  }

  getPromoData(): Promo {
    return this.promoData;
  }

  apiGetListaPromoByIdAttivita(id:number): Observable<Promo[]>{
    return this.http.get<Promo[]>(this.constants.BasePath()+'/Promo/get-promo-attive-by-idattivita?idAttivita='+id);
  }

  apiGetListaPromoByIdAttivitaAndUser(id: number, idSoggetto: number): Observable<Promo[]> {
    return this.http.get<Promo[]>(this.constants.BasePath()+'/Promo/get-promo-attive-by-idattivita-user?idAttivita=' + id + '&idSoggetto=' + idSoggetto);
  }

  apiDeletePromoByIdPromo(id: number): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    return this.http.post<number>(this.constants.BasePath()+'/Promo/delete-promo-by-idpromo', JSON.stringify(id), httpOptions);
  }

  apiInsertPromo(promo: InsertPromoReqDto): Observable<any> {
    return this.http.post<InsertPromoReqDto>(this.constants.BasePath()+`/Promo/insert-promo`, promo);
  }

  apiInsertPromoAttiva(promo: InsertPromoUserAttiva): Observable<any> {
    return this.http.post<InsertPromoUserAttiva>(this.constants.BasePath()+`/Promo/insert-promo-user-attiva`, promo);
  }

  apiUpdatePromo(promo: InsertPromoReqDto): Observable<any> {
    return this.http.post<InsertPromoReqDto>(this.constants.BasePath()+`/Promo/update-promo`, promo);
  }
}
