import { Attivita, TipoAttivita, InsertAttivitaReqDto, AttivitaHomePageResponse, AttivitaSession, Orari, Immagini, AttivitaFiltrate, FiltriAttivita, AttivitaRicerca } from './EntityInterface/Attivita';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Constants } from './Constants';

@Injectable({
  providedIn: 'root'
})
export class GetApiAttivitaService {
 
  listaAttivitaPerRicerca!: AttivitaRicerca[];
  listaTipoAttivita : TipoAttivita [] | undefined;
  listaAttivitaNearHome : Attivita[] | undefined;
  listaAttivitaPromoHome : Attivita[] | undefined;

  insertAttivita !: InsertAttivitaReqDto;
  attivita !: Attivita;
  attivitaFiltrate !: AttivitaFiltrate;
  attivitaFiltrateResult !: AttivitaFiltrate | null;
  filtroAttivita !: FiltriAttivita;
  private attivitaSubject = new BehaviorSubject<Attivita | null>(null);
  sessioneAttivita !: AttivitaSession | null;
  private listaAttivitaDDLSubject = new BehaviorSubject<TipoAttivita[] | null>(null);
  listaAttivitaDDL$ = this.listaAttivitaDDLSubject.asObservable();

  constructor(private http:HttpClient, private constants:Constants) { }

  apiGetListaAttivita(): Observable<Attivita[]>{
    return this.http.get<Attivita[]>(this.constants.BasePath()+'/Attivita/get-attivita');
  }

  apiGetListaAttivitaHomePage(): Observable<AttivitaHomePageResponse>{
    return this.http.get<AttivitaHomePageResponse>(this.constants.BasePath()+'/Attivita/get-attivita-home-page');
  }

  GetFavorites(idSoggetto:number): Observable<Attivita[]>{
    return this.http.get<Attivita[]>(this.constants.BasePath()+'/Attivita/get-favorites?idSoggetto='+idSoggetto);
  }

  
  createListaTipoAttivitaSession(listaTipoAtt:TipoAttivita[]){
    if(listaTipoAtt)
      this.listaTipoAttivita = listaTipoAtt;
  }

  async apiGetListaAttivitaFiltrate(filtro: FiltriAttivita): Promise<Observable<AttivitaFiltrate>> {
    let params = new HttpParams();
    
    // Aggiungi i parametri alla query solo se sono definiti
    if(filtro.tipoRicerca)
      params = params.set('tipoRicerca', filtro.tipoRicerca.toString());
    if (filtro.nome) 
      params = params.set('nome', filtro.nome);
    if (filtro.citta) 
      params = params.set('citta', filtro.citta);
    if (filtro.provincia) 
      params = params.set('provincia', filtro.provincia);
    if (filtro.codTipoAttivita) 
      params = params.set('codTipoAttivita', filtro.codTipoAttivita);
    
    if(filtro && filtro.latitudine == undefined && filtro.longitudine == undefined)
    {
      const getPositionAsync = async (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      };
      try {
        const position = await getPositionAsync();
        if (position.coords.latitude != null && position.coords.longitude != null) {
          params = params.set('latitudine', position.coords.latitude.toString());
          params = params.set('longitudine', position.coords.longitude.toString());
        }
      } catch (error) {
        console.error("Errore durante il recupero della posizione:", error);
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

  apiGetAttivitaByIdSoggetto(id:number): Observable<any>{
    return this.http.get(this.constants.BasePath()+'/Attivita/get-attivita-by-id?idSoggetto='+id);
  }

  apiGetListaDecAttivita(): Observable<TipoAttivita[]>{
    return this.http.get<TipoAttivita[]>(this.constants.BasePath()+'/Attivita/get-lista-tipoAttivita');
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
    return this.http.post<InsertAttivitaReqDto>(this.constants.BasePath()+`/Attivita/insert-attivita`, attivita);
  }

  apiUpdateAttivita(attivita: InsertAttivitaReqDto): Observable<any> {
    return this.http.post<InsertAttivitaReqDto>(this.constants.BasePath()+`/Attivita/update-attivita`, attivita);
  }

  apiGetAttivitaByIdAttivita(id:number | undefined): Observable<any>{
    return this.http.get(this.constants.BasePath()+'/Attivita/get-attivita?idAttivita='+id);
  }

  createListAttivitaNearHomeSession(list:Attivita []){
    this.listaAttivitaNearHome = list;
  }
  
    createListaAttivitaPerRicercaSession(listaAttRicerca:AttivitaRicerca[]){
    if(listaAttRicerca)
      this.listaAttivitaPerRicerca = listaAttRicerca;
  }
  
  apiGetListaAttivitaPerRicerca(): Observable<AttivitaRicerca[]>{
    return this.http.get<AttivitaRicerca[]>(this.constants.BasePath()+'/Attivita/get-lista-attivita');
  }
  
  GetListaAttivitaPerRicercaSession(){
    return this.listaAttivitaPerRicerca;
  }

  createAttivitaSession(idAtt: number, idSogg: number, nome: string, indirizzo: string, citta: string, provincia: string, civico: string, cap: string, latitudine: number, longitudine: number, telefono: string, cellulare: string, isCellPubblico: boolean, email: string, descrizione: string, descrizioneOfferta: string, isPromoPresente: boolean, isOffertaVegetariana: boolean, isOffertaVegana: boolean, isOffertaNoGlutine: boolean, listaTipoAttivita: TipoAttivita[], orari: Orari, immagini: Immagini[]){
    this.sessioneAttivita = new AttivitaSession(idAtt, idSogg, nome, indirizzo, citta, provincia, civico, cap, latitudine, longitudine, telefono, cellulare, isCellPubblico, email, descrizione, descrizioneOfferta, isPromoPresente, isOffertaVegetariana, isOffertaVegana, isOffertaNoGlutine, listaTipoAttivita, orari, immagini);
  }
  GetListaTipoAttivitaSession(){
    return this.listaTipoAttivita;
  }
  createListAttivitaPromoHomeSession(list:Attivita []){
    this.listaAttivitaPromoHome = list;
  }

  getListAttivitaPromoHomeSession(){
    return this.listaAttivitaPromoHome;
  }
  getListAttivitaNearHomeSession(){
    return this.listaAttivitaNearHome;
  }

  GetDatiAttivitaSession() {
    if(this.sessioneAttivita)
    {
      this.attivita.idAttivita = this.sessioneAttivita.idAttivita;
      this.attivita.idSoggetto = this.sessioneAttivita.idSoggetto;
      this.attivita.nome = this.sessioneAttivita.nome;
      this.attivita.indirizzo = this.sessioneAttivita.indirizzo;
      this.attivita.citta = this.sessioneAttivita.citta;
      this.attivita.provincia = this.sessioneAttivita.provincia;
      this.attivita.civico = this.sessioneAttivita.civico;
      this.attivita.cap = this.sessioneAttivita.cap;
      this.attivita.latitudine = this.sessioneAttivita.latitudine;
      this.attivita.longitudine = this.sessioneAttivita.longitudine;
      this.attivita.telefono = this.sessioneAttivita.telefono;
      this.attivita.cellulare = this.sessioneAttivita.cellulare;
      this.attivita.isCellPubblico = this.sessioneAttivita.isCellPubblico;
      this.attivita.email = this.sessioneAttivita.email;
      this.attivita.descrizione = this.sessioneAttivita.descrizione;
      this.attivita.descrizioneOfferta = this.sessioneAttivita.descrizioneOfferta;
      this.attivita.isPromoPresente = this.sessioneAttivita.isPromoPresente;
      this.attivita.isOffertaVegetariana = this.sessioneAttivita.isOffertaVegetariana;
      this.attivita.isOffertaVegana = this.sessioneAttivita.isOffertaVegana;
      this.attivita.isOffertaNoGlutine = this.sessioneAttivita.isOffertaNoGlutine;
      this.attivita.listaTipoAttivita = this.sessioneAttivita.listaTipoAttivita;
      this.attivita.orari = this.sessioneAttivita.orari;
      this.attivita.immagini = this.sessioneAttivita.immagini;
    }
    return this.attivita;
  }
  
  deleteSession(){
    this.attivitaSubject.next(null);
  }

  setListaAttivitaFiltrate(data: AttivitaFiltrate) {
    this.attivitaFiltrateResult = data;
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

  
}
