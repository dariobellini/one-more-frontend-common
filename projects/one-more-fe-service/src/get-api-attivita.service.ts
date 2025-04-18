import { Attivita, TipoAttivita, InsertAttivitaReqDto, AttivitaHomePageResponse, Orari, Immagini, AttivitaFiltrate, FiltriAttivita, AttivitaRicerca, DeleteAttivita, ReqAttivitaAutocomplete } from './EntityInterface/Attivita';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Constants } from './Constants';
import { AuthService } from './Auth/auth.service';
import { LocationService } from './location.service';

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
              private locationService: LocationService) { }
  
async apiGetListaAttivitaJustSigned(latitudine: number, longitudine: number): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine.toString(),
      longitudine: longitudine.toString(),
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-just-signed',
      { params }
    );
  }

  async apiGetListaAttivitaNear(latitudine: number, longitudine: number): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine.toString(),
      longitudine: longitudine.toString(),
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-near',
      { params }
    );
  }

  async apiGetListaAttivitaWhitPromo(latitudine: number, longitudine: number): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine.toString(),
      longitudine: longitudine.toString(),
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-whit-promo',
      { params }
    );
  }


  async GetFavorites(idSoggetto:number): Promise<Observable<Attivita[]>>{
    return this.http.get<Attivita[]>(this.constants.BasePath()+'/Attivita/get-favorites?idSoggetto='+idSoggetto);
  }

  createListaTipoAttivitaSession(listaTipoAtt:TipoAttivita[]){
    if(listaTipoAtt)
      this.listaTipoAttivita = listaTipoAtt;
  }

  async apiGetListaAttivitaFiltrate(filtro: FiltriAttivita): Promise<Observable<AttivitaFiltrate>> {
    let params = new HttpParams();
    
    // Aggiungi i parametri alla query solo se sono definiti
    if (filtro.nome) 
      params = params.set('nome', filtro.nome);
    if (filtro.citta) 
      params = params.set('citta', filtro.citta);
    if (filtro.provincia) 
      params = params.set('provincia', filtro.provincia);
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
    
    if (filtro.isPromoPresente) 
      params = params.set('isPromoPresente', filtro.isPromoPresente);
    if (filtro.dataFinePromo) 
      params = params.set('dataFinePromo', filtro.dataFinePromo.toDateString());

    if (filtro.isLunedi) 
      params = params.set('isLunedi', filtro.isLunedi);
    if (filtro.isMartedi) 
      params = params.set('isMartedi', filtro.isMartedi);
    if (filtro.isMercoledi) 
      params = params.set('isMercoledi', filtro.isMercoledi);
    if (filtro.isGiovedi) 
      params = params.set('isGiovedi', filtro.isGiovedi);
    if (filtro.isVenerdi) 
      params = params.set('isVenerdi', filtro.isVenerdi);
    if (filtro.isSabato) 
      params = params.set('isSabato', filtro.isSabato);
    if (filtro.isDomenica) 
      params = params.set('isDomenica', filtro.isDomenica);
    if (filtro.isAllDayValidita) 
      params = params.set('isAllDayValidita', filtro.isAllDayValidita);

    if (filtro.orarioValiditaDa) 
      params = params.set('orarioValiditaDa', filtro.orarioValiditaDa);
    if (filtro.orarioValiditaAl) 
      params = params.set('orarioValiditaAl', filtro.orarioValiditaAl);
    if (filtro.codTipoPromo && filtro.codTipoPromo.length > 0) {
      filtro.codTipoPromo.forEach((promo) => {
          params = params.append('codTipoPromo', promo.toString());
      });
    }

    params = params.set('isMovingMap', filtro.isMovingMap ? filtro.isMovingMap : false);
      
    params = params.set('isHomePage', filtro.isHomePage ? filtro.isHomePage : false);

    params = params.set('typeFilterHomePage', filtro.typeFilterHomePage ? filtro.typeFilterHomePage : 0);
    if(filtro.tipoRicercaAttivita)
      params = params.set('tipoRicercaAttivita',filtro.tipoRicercaAttivita ? filtro.tipoRicercaAttivita : 0);
    return this.http.get<AttivitaFiltrate>(this.constants.BasePath()+'/Attivita/get-attivita-filtrata', { params });
  }

  apiGetListaTop3ImmaginiById(id:number): Observable<Immagini[]>{
    return this.http.get<Immagini[]>(this.constants.BasePath()+'/Attivita/get-top3-immagini/' + id);
  }

  apiGetListaImmaginiById(id:number): Observable<Immagini[]>{
    return this.http.get<Immagini[]>(this.constants.BasePath()+'/Attivita/get-lista-immagini/' + id);
  }

  apiGetOrariById(id:number): Observable<Orari>{
    return this.http.get<Orari>(this.constants.BasePath()+'/Attivita/get-orari-attivita/' + id);
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
    return this.http.get(this.constants.BasePath() + '/Attivita/get-lista-attivita-by-id?idSoggetto=' + idSoggetto);
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
    const params = new HttpParams()
      .set('idSoggetto', id.toString())
    return this.http.get<AttivitaRicerca[]>(this.constants.BasePath()+'/Attivita/get-favorites', {params});
  }

  apiGetListaTipoAttivitaById(id:number): Observable<TipoAttivita[]>{
    return this.http.get<TipoAttivita[]>(this.constants.BasePath()+'/Attivita/get-lista-tipoAttivita-by-id'+id);
  }

  apiInsertAttivita(attivita: InsertAttivitaReqDto): Observable<any> {
    return this.http.post<InsertAttivitaReqDto>(this.constants.BasePath() + `/Attivita/insert-attivita`, attivita);
  }

  apiUpdateAttivita(attivita: InsertAttivitaReqDto): Observable<any> {
    return this.http.post<InsertAttivitaReqDto>(this.constants.BasePath() + `/Attivita/update-attivita`, attivita);
  }

  async apiGetAttivitaByIdAttivita(id: number | undefined): Promise<any> {
    this.language = this.authService.getLanguageSession();
    if (!this.language) {
        this.language = "it";
    }
    
    return await firstValueFrom(
        this.http.get(this.constants.BasePath() + '/Attivita/get-attivita', {
            params: {
                idAttivita: id?.toString() || '',
                lang: this.language.toUpperCase()
            }
        })
    );
  }

  async apiGetAttivitaAutocomplete(datiAttivita: ReqAttivitaAutocomplete): Promise<any> {
    this.language = this.authService.getLanguageSession();
    if (!this.language) {
        this.language = "it";
    }
    
    return await firstValueFrom(
        this.http.get(this.constants.BasePath() + '/Attivita/get-attivita-autocomplete', {
            params: {
              nome: datiAttivita.nome || '',
              citta: datiAttivita.citta || '',
              indirizzo: datiAttivita.indirizzo || '',
              lang: this.language.toUpperCase()
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
  
  async apiGetListaAttivitaPreSearch(): Promise<AttivitaRicerca[]> {
    return await firstValueFrom(
      this.http.get<AttivitaRicerca[]>(this.constants.BasePath() + '/Attivita/get-lista-attivita-pre-search')
    );
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
