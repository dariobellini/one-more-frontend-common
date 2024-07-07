import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { InsertPromoReqDto, InsertPromoUserAttiva, Promo } from './EntityInterface/Promo';


@Injectable({
  providedIn: 'root'
})
export class GetApiPromoService {

  promo !: Promo;
  promoData !: Promo;
  
  constructor(private http:HttpClient) { }

  setPromoData(promo: Promo) {
    this.promoData = promo;
  }

  getPromoData(): Promo {
    return this.promoData;
  }

  apiGetListaPromoByIdAttivita(id:number): Observable<Promo[]>{
    return this.http.get<Promo[]>('https://localhost:7253/Promo/get-promo-attive-by-idattivita?idAttivita='+id);
  }

  apiGetListaPromoByIdAttivitaAndUser(id: number, idSoggetto: number): Observable<Promo[]> {
    return this.http.get<Promo[]>('https://localhost:7253/Promo/get-promo-attive-by-idattivita-user?idAttivita=' + id + '&idSoggetto=' + idSoggetto);
  }

  apiDeletePromoByIdPromo(id: number): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    return this.http.post<number>('https://localhost:7253/Promo/delete-promo-by-idpromo', JSON.stringify(id), httpOptions);
  }

  apiInsertPromo(promo: InsertPromoReqDto): Observable<any> {
    return this.http.post<InsertPromoReqDto>(`https://localhost:7253/Promo/insert-promo`, promo);
  }

  apiInsertPromoAttiva(promo: InsertPromoUserAttiva): Observable<any> {
    return this.http.post<InsertPromoUserAttiva>(`https://localhost:7253/Promo/insert-promo-user-attiva`, promo);
  }

  apiUpdatePromo(promo: InsertPromoReqDto): Observable<any> {
    return this.http.post<InsertPromoReqDto>(`https://localhost:7253/Promo/update-promo`, promo);
  }
}
