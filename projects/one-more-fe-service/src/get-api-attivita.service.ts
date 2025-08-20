import { Attivita, TipoAttivita, InsertAttivitaReqDto, Orari, Immagini, AttivitaFiltrate, FiltriAttivita, AttivitaRicerca, DeleteAttivita, ReqAttivitaAutocomplete, InsertAttivitaResponse, AttivitaWithPromos } from './EntityInterface/Attivita';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Constants } from './Constants';
import { AuthService } from './Auth/auth.service';
import { LocationService } from './location.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class GetApiAttivitaService {
 
  language : string | undefined;
  listaAttivitaPerRicerca!: AttivitaRicerca[];
  listaTipoAttivita : TipoAttivita [] | undefined;
  listaAttivitaNewHome : Attivita[] | undefined;
  listaAttivitaPromoHome : Attivita[] | undefined;
  listaAttivitaVicine : Attivita[] | undefined;
  listaCitta : string[] | undefined;
  isListaAttModalOpen : boolean = false;
  filter: FiltriAttivita | undefined;
  insertAttivita !: InsertAttivitaReqDto;
  attivita !: Attivita;
  attivitaFiltrate !: AttivitaFiltrate;
  attivitaFiltrateResult !: AttivitaFiltrate | null;
  filtroAttivita !: FiltriAttivita;
  private attivitaSubject = new BehaviorSubject<Attivita | null>(null);
  private listaAttivitaDDLSubject = new BehaviorSubject<TipoAttivita[] | null>(null);
  listaAttivitaDDL$ = this.listaAttivitaDDLSubject.asObservable();
  
  constructor(private http:HttpClient, 
              private constants:Constants,
              private authService: AuthService,
              private locationService: LocationService,
              private storageService: StorageService) { }
  
  async apiGetListaAttivitaJustSigned(latitudine: number, longitudine: number, isHomePage: boolean): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine.toString(),
      longitudine: longitudine.toString(),
      isHomePage: isHomePage
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-just-signed',
      { params }
    );
  }

  async apiGetListaAttivitaNear(latitudine: number, longitudine: number, isHomePage: boolean): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine.toString(),
      longitudine: longitudine.toString(),
      isHomePage: isHomePage
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-near',
      { params }
    );
  }

  async apiGetListaAttivitaWhitPromo(latitudine: number, longitudine: number, isHomePage: boolean): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine.toString(),
      longitudine: longitudine.toString(),
      isHomePage: isHomePage
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-whit-promo',
      { params }
    );
  }

  async apiGetListaAttivitaRecentView(idSoggetto: number): Promise<Observable<Attivita[]>> {
    const params = {
      id: idSoggetto.toString()
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-recent-view',
      { params }
    );
  }

  async apiGetListaAttivitaFoodDrinkPromo(latitudine: number, longitudine: number, codConsumazione:number, isHomePage: boolean): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine.toString(),
      longitudine: longitudine.toString(),
      codConsumazione : codConsumazione,
      isHomePage: isHomePage
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-food-drink-Promo',
      { params }
    );
  }

  async GetFavorites(idSoggetto:number): Promise<Observable<Attivita[]>>{
    this.language = this.authService.getLanguageSession();
    if (!this.language) {
      this.language = "it";
    }
    const params = new HttpParams()
      .set('idSoggetto', idSoggetto.toString())
      .set('lang', this.language.toUpperCase())
    return this.http.get<Attivita[]>(this.constants.BasePath()+'/Attivita/get-favorites', {params});
  }

  createListaTipoAttivitaSession(listaTipoAtt:TipoAttivita[]){
    if(listaTipoAtt)
      this.listaTipoAttivita = listaTipoAtt;
  }

  async apiGetListaAttivitaFiltrate(filtro: FiltriAttivita): Promise<Observable<AttivitaFiltrate>> {
    let params = new HttpParams();

    this.language = this.authService.getLanguageSession();
    if (!this.language) {
      this.language = "it";
    }

    if(this.language)
      params = params.set('lang', this.language.toUpperCase());
    
    // Aggiungi i parametri alla query solo se sono definiti
    if (filtro.idAttivita) 
      params = params.set('idAttivita', filtro.idAttivita);

    if (filtro.nome) 
      params = params.set('nome', filtro.nome);

    if (filtro.citta) 
      params = params.set('citta', filtro.citta);

    if (filtro.codTipoAttivita) 
      params = params.set('codTipoAttivita', filtro.codTipoAttivita);

   
    if (filtro && filtro.latitudine === undefined && filtro.longitudine === undefined) {

      try {
        const position = await this.locationService.getCurrentLocation();
    
        if (position.latitudine != null && position.longitudine != null) {
          params = params.set('latitudine', position.latitudine.toString());
          params = params.set('longitudine', position.longitudine.toString());
        }
      } catch (error) {
        console.error('Errore durante il recupero della posizione:', error);
      }
    }
    else if(filtro.latitudine && filtro.longitudine)
    {
      params = params.set('latitudine', filtro.latitudine);
      params = params.set('longitudine', filtro.longitudine);
    }
    
    if (filtro.codTipoPromo && filtro.codTipoPromo.length > 0) {
      filtro.codTipoPromo.forEach((promo) => {
          params = params.append('codTipoPromo', promo.toString());
      });
    }

    params = params.set('isMovingMap', filtro.isMovingMap ? filtro.isMovingMap : false);
      
    params = params.set('isHomePage', filtro.isHomePage ? filtro.isHomePage : false);

    //params = params.set('typeFilterHomePage', filtro.typeFilterHomePage ? filtro.typeFilterHomePage : 0);

    if (filtro.days && filtro.days.length > 0) {
      filtro.days.forEach(day => {
        params = params.append('days', day.toString());
      });
    }
    if(filtro.tipoRicercaAttivita)
      params = params.set('tipoRicercaAttivita',filtro.tipoRicercaAttivita ? filtro.tipoRicercaAttivita : 0);
    
    if(filtro.codTipoPeriodoList && filtro.codTipoPeriodoList.length > 0)
      params =params.set('CodTipoPeriodoList', filtro.codTipoPeriodoList.join(','))
    return this.http.get<AttivitaFiltrate>(this.constants.BasePath()+'/Attivita/get-attivita-filtrata', { params });
  }

  apiGetListaTop3ImmaginiById(id:number): Observable<Immagini[]>{
    return this.http.get<Immagini[]>(this.constants.BasePath()+'/Attivita/get-top3-immagini/' + id);
  }

  apiGetListaImmaginiById(id:number): Observable<Immagini[]>{
    return this.http.get<Immagini[]>(this.constants.BasePath()+'/Attivita/get-lista-immagini/' + id);
  }

  apiGetAttivitaByIdSoggettoAndAtt(idSoggetto: number, idAttivita: number): Observable<any> {
    this.language = this.authService.getLanguageSession();
    if(this.language == undefined)
      this.language = "it";
    return this.http.get(this.constants.BasePath() + '/Attivita/get-attivita-by-id', {
        params: {
            idSoggetto: idSoggetto.toString(),
            idAttivita: idAttivita.toString(),
            lang: this.language.toUpperCase(),
        }
    });
  }

  apiGetAttivitaByIdSoggetto(idSoggetto: number): Observable<any> {
    this.language = this.authService.getLanguageSession();
    if (!this.language) {
      this.language = "it";
    }
  
    return this.http.get(
      this.constants.BasePath() + '/Attivita/get-lista-attivita-by-id',
      {
        params: {
          idSoggetto: idSoggetto.toString(),
          lang: this.language
        }
      }
    );
  }

  async apiGetListaDecAttivita(): Promise<Observable<TipoAttivita[]>>{
    this.language = this.authService.getLanguageSession() || 'it';

    return this.http.get<TipoAttivita[]>(this.constants.BasePath()+'/Attivita/get-lista-tipoAttivita',{
              params: {
                  lang: this.language.toUpperCase()
              }
          })
  }

  apiGetAttivitaFavorite(id:number): Observable<AttivitaRicerca[]>{
    this.language = this.authService.getLanguageSession();
    if (!this.language) {
      this.language = "it";
    }
    const params = new HttpParams()
      .set('idSoggetto', id.toString())
      .set('lang', this.language.toUpperCase())
    return this.http.get<AttivitaRicerca[]>(this.constants.BasePath()+'/Attivita/get-favorites', {params});
  }

  apiGetListaTipoAttivitaById(id:number): Observable<TipoAttivita[]>{
    return this.http.get<TipoAttivita[]>(this.constants.BasePath()+'/Attivita/get-lista-tipoAttivita-by-id'+id);
  }

  async apiInsertAttivita(attivita: InsertAttivitaReqDto): Promise<InsertAttivitaResponse> {
    const lang = this.authService.getLanguageSession() || 'IT'; 
    return await firstValueFrom(
      this.http.post<InsertAttivitaResponse>(this.constants.BasePath() + `/Attivita/insert-attivita`,attivita, {params: {
        lang: lang.toUpperCase(),
        }
      })
    );
  }

  async apiUpdateAttivita(attivita: InsertAttivitaReqDto): Promise<any> {
    const lang = this.authService.getLanguageSession() || 'IT'; 
    return await firstValueFrom(
      this.http.post<InsertAttivitaReqDto>(this.constants.BasePath() + `/Attivita/update-attivita`,attivita, {params: {
        lang: lang.toUpperCase(),
        }
      })
    );
  }

    async apiGetAttivitaByIdAttivita(
      id: number | undefined,
      idSoggetto: number | undefined
    ): Promise<any> {
      this.language = this.authService.getLanguageSession();
      if (!this.language) {
        this.language = "it";
      }
    
      const params: any = {
        idAttivita: id?.toString() || '',
        lang: this.language.toUpperCase()
      };
    
      if (idSoggetto !== undefined && idSoggetto !== null) {
        params.idSoggetto = idSoggetto.toString();
      }
    
      // Fai la GET normalmente
      const attivita = await firstValueFrom(
        this.http.get<Attivita>(this.constants.BasePath() + '/Attivita/get-attivita', {
          params: params
        })
      );
    
      // Dopo la GET: aggiorna la cache "attivita_recent_view"
      const cacheKey = `attivita_recent_view`;
      const cachedData: Attivita[] = await this.storageService.getItem(cacheKey) || [];
    
      // Rimuovi l'attività se già presente (per evitare duplicati)
      const updatedList = cachedData.filter(a => a.idAttivita !== attivita.idAttivita);

      // Recupero l'immagine principale
      const immaginePrincipale = attivita.immagini?.find(img => (img.isImmaginePrincipale && img.isVerificata) || img.isImmaginePrincipaleTemp);
      attivita.uploadImgPrincipale = immaginePrincipale ? immaginePrincipale.upload : 'URL_IMMAGINE_FALLBACK';
      // Inserisci l'attività in testa
      updatedList.unshift(attivita);

      // Se superi 15 elementi, rimuovi l'ultimo
      if (updatedList.length > 15) {
        updatedList.pop();
      }
    
      // Salva di nuovo la lista aggiornata
      await this.storageService.setItem(cacheKey, updatedList, 8640000);
    
      return attivita;
    }

  async apiGetAttivitaAutocomplete(placeId: string): Promise<any> {
    this.language = this.authService.getLanguageSession();
    return await firstValueFrom(
        this.http.get(this.constants.BasePath() + '/Attivita/get-detail-attivita-autocomplete', {
            params: {
              placeId: placeId || '',
              lang: this.language.toUpperCase()
            }
        })
    );
  }

  async apiGetListaAttivitaAutocomplete(datiAttivita: ReqAttivitaAutocomplete): Promise<Attivita[]> {
    this.language = this.authService.getLanguageSession();
    return await firstValueFrom(
      this.http.get<Attivita[]>(this.constants.BasePath() + '/Attivita/get-lista-attivita-autocomplete', {
        params: {
          nome: datiAttivita.nome || '',
          citta: datiAttivita.citta || '',
          indirizzo: datiAttivita.indirizzo || '',
          lang: this.language || 'IT'
        }
      })
    );
  }

  createListAttivitaNewHomeSession(list:Attivita []){
    this.listaAttivitaNewHome = list;
  }
  
  createListaAttivitaPerRicercaSession(listaAttRicerca:AttivitaRicerca[]){
    if(listaAttRicerca)
      this.listaAttivitaPerRicerca = listaAttRicerca;
  }
  
  
  GetListaAttivitaPerRicercaSession(){
    return this.listaAttivitaPerRicerca;
  }

  GetListaTipoAttivitaSession(){
    return this.listaTipoAttivita;
  }
  createListAttivitaPromoHomeSession(list:Attivita []){
    this.listaAttivitaPromoHome = list;
  }
  createListAttivitaVicineSession(list:Attivita []){
    this.listaAttivitaPromoHome = list;
  }
  createListCittaIconSession(list:string []){
    this.listaCitta = list;
  }

  getListAttivitaPromoHomeSession(){
    return this.listaAttivitaPromoHome;
  }
  getListAttivitaNewSession(){
    return this.listaAttivitaNewHome;
  }
  getListAttivitaVicineHomeSession(){
    return this.listaAttivitaVicine;
  }

  deleteSession(){
    this.attivitaSubject.next(null);
  }

  setListaAttivitaFiltrate(data: AttivitaFiltrate) {
    this.attivitaFiltrateResult = data;
  }

  setIsListaAttModalOpen(isOpen: boolean){
    this.isListaAttModalOpen = isOpen;
  }

  setFilter(filtro: FiltriAttivita | undefined){
    if(filtro)
      this.filter = filtro;
    else
      this.filter = undefined;
  }

  getFilter(){
    return this.filter;
  }

  getIsListaModalOpen(){
    return this.isListaAttModalOpen;
  }

  resetListaAttivitaFiltrate() {
    this.attivitaFiltrateResult = null;
  }

  getListaAttivita() {
    return this.attivitaFiltrateResult;
  }

  setlistaAttivitaDDL(listaTipoAttivita: TipoAttivita[]) {
    listaTipoAttivita.sort((a, b) => {
      const descrizioneA = a.descrizione.toLowerCase();
      const descrizioneB = b.descrizione.toLowerCase();
      if (descrizioneA < descrizioneB) {
        return -1;
      }
      if (descrizioneA > descrizioneB) {
        return 1;
      }
      return 0;
    });
    this.listaAttivitaDDLSubject.next(listaTipoAttivita);
  }
  
  getlistaAttivitaDDL(): Observable<TipoAttivita[] | null> {
    return this.listaAttivitaDDL$;
  }

  apiDeleteAttivita(idAttivita: number, idSoggetto: number): Observable<any> {

    const attivita = new DeleteAttivita();
    if (idAttivita && idSoggetto) {
        attivita.idAttivita = idAttivita ? idAttivita : 0;
        attivita.idSoggetto = idSoggetto ? idSoggetto : 0;
    }

    const options = {
      body: attivita
  };

    return this.http.delete<DeleteAttivita>(this.constants.BasePath() + '/Attivita/delete-attivita', options);
  }

}
