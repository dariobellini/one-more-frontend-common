import { Attivita, TipoAttivita, InsertAttivitaReqDto, Immagini, AttivitaFiltrate, FiltriAttivita, AttivitaRicerca, DeleteAttivita, InsertAttivitaResponse, AttivitaWithPromos } from '../EntityInterface/Attivita';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Constants } from '../Constants';
import { LocationService } from './location.service';
import { CacheServiceV2  } from './cache-storage.service';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class GetApiAttivitaService {
 
  // ✅ Costanti per la cache
  private readonly RECENT_VIEW_KEY = 'attivita_recent_view';
  private readonly RECENT_VIEW_CATEGORY = 'user-activity';
  private readonly RECENT_VIEW_MAX_ITEMS = 15;
  private readonly RECENT_VIEW_TTL = 30 * 24 * 60 * 60 * 1000; // 30 giorni

  language: string | undefined;
  listaAttivitaPerRicerca! : AttivitaRicerca[];
  listaTipoAttivita: TipoAttivita[] | undefined;
  listaAttivitaNewHome: Attivita[] | undefined;
  listaAttivitaPromoHome: Attivita[] | undefined;
  listaAttivitaVicine:  Attivita[] | undefined;
  listaCitta: string[] | undefined;
  isListaAttModalOpen: boolean = false;
  filter: FiltriAttivita | undefined;
  insertAttivita! : InsertAttivitaReqDto;
  attivita! :  Attivita;
  attivitaFiltrate!: AttivitaFiltrate;
  attivitaFiltrateResult! : AttivitaFiltrate | null;
  filtroAttivita!: FiltriAttivita;
  private attivitaSubject = new BehaviorSubject<Attivita | null>(null);
  private listaAttivitaDDLSubject = new BehaviorSubject<TipoAttivita[] | null>(null);
  listaAttivitaDDL$ = this.listaAttivitaDDLSubject.asObservable();

  http = inject(HttpClient);
  constants = inject(Constants);
  locationService = inject(LocationService);
  cacheService = inject(CacheServiceV2);
  languageService = inject(LanguageService);
  
  constructor() { }
  
  async apiGetListaAttivitaJustSigned(latitudine: number, longitudine: number, isHomePage: boolean): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine. toString(),
      longitudine: longitudine.toString(),
      isHomePage: isHomePage
    };
  
    return this.http.get<Attivita[]>(
      this. constants.BasePath() + '/Attivita/get-top-activities-just-signed',
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

  async apiGetListaAttivitaWhitPromo(latitudine: number, longitudine: number, isHomePage:  boolean): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine:  latitudine.toString(),
      longitudine: longitudine.toString(),
      isHomePage: isHomePage
    };
  
    return this.http.get<Attivita[]>(
      this. constants.BasePath() + '/Attivita/get-top-activities-whit-promo',
      { params }
    );
  }

  async apiGetListaAttivitaRecentView(idSoggetto: number): Promise<Observable<Attivita[]>> {
    const params = {
      id:  idSoggetto.toString()
    };
  
    return this.http.get<Attivita[]>(
      this. constants.BasePath() + '/Attivita/get-top-activities-recent-view',
      { params }
    );
  }

  async apiGetListaAttivitaFoodDrinkPromo(latitudine: number, longitudine: number, codConsumazione: number, isHomePage: boolean): Promise<Observable<Attivita[]>> {
    const params = {
      latitudine: latitudine.toString(),
      longitudine: longitudine.toString(),
      codConsumazione: codConsumazione,
      isHomePage: isHomePage
    };
  
    return this.http.get<Attivita[]>(
      this.constants.BasePath() + '/Attivita/get-top-activities-food-drink-Promo',
      { params }
    );
  }

  async GetFavorites(idSoggetto: number): Promise<Observable<Attivita[]>> {
    this.language = this.languageService.getCurrentLanguage() || 'it';
    if (! this.language) {
      this.language = "it";
    }
    const params = new HttpParams()
      .set('idSoggetto', idSoggetto.toString())
      .set('lang', this.language. toUpperCase())
    return this.http.get<Attivita[]>(this.constants.BasePath() + '/Attivita/get-favorites', { params });
  }

  createListaTipoAttivitaSession(listaTipoAtt: TipoAttivita[]) {
    if (listaTipoAtt)
      this.listaTipoAttivita = listaTipoAtt;
  }

  async apiGetListaAttivitaFiltrate(filtro: FiltriAttivita): Promise<Observable<AttivitaFiltrate>> {
    let params = new HttpParams();

    this.language = this.languageService.getCurrentLanguage() || 'it';
    if (!this.language) {
      this.language = "it";
    }

    if (this.language)
      params = params.set('lang', this.language.toUpperCase());
    
    if (filtro. idAttivita) 
      params = params.set('idAttivita', filtro. idAttivita);

    if (filtro.nome) 
      params = params.set('nome', filtro.nome);

    if (filtro.citta) 
      params = params.set('citta', filtro.citta);

    if (filtro.codTipoAttivita) 
      params = params.set('codTipoAttivita', filtro.codTipoAttivita);

    if (filtro && filtro.latitudine === undefined && filtro.longitudine === undefined) {
      try {
        const location = await this.locationService.getCurrentLocation();
        if (location && location. latitudine != null && location.longitudine != null) {
          params = params.set('latitudine', location.latitudine.toString());
          params = params.set('longitudine', location.longitudine.toString());
        }
      } catch (error) {
        console.error('Errore durante il recupero della posizione:', error);
      }
    } else if (filtro. latitudine && filtro.longitudine) {
      params = params.set('latitudine', filtro.latitudine);
      params = params.set('longitudine', filtro.longitudine);
    }
    
    if (filtro.codTipoPromo && filtro.codTipoPromo. length > 0) {
      filtro.codTipoPromo. forEach((promo) => {
        params = params. append('codTipoPromo', promo. toString());
      });
    }

    params = params.set('isMovingMap', filtro.isMovingMap ? filtro.isMovingMap :  false);
    params = params.set('isHomePage', filtro.isHomePage ? filtro.isHomePage :  false);

    if (filtro.days && filtro.days.length > 0) {
      filtro.days.forEach(day => {
        params = params.append('days', day. toString());
      });
    }

    if (filtro.tipoRicercaAttivita)
      params = params.set('tipoRicercaAttivita', filtro.tipoRicercaAttivita ?  filtro.tipoRicercaAttivita : 0);
    
    if (filtro. codTipoPeriodoList && filtro.codTipoPeriodoList.length > 0)
      params = params.set('codTipoPeriodoList', filtro.codTipoPeriodoList.join(','))

    if (filtro.codTipoConsumazione)
      params = params.set('codTipoConsumazione', filtro.codTipoConsumazione);

    return this.http.get<AttivitaFiltrate>(this.constants.BasePath() + '/Attivita/get-attivita-filtrata', { params });
  }

  apiGetListaTop3ImmaginiById(id: number): Observable<Immagini[]> {
    return this.http.get<Immagini[]>(this.constants.BasePath() + '/Attivita/get-top3-immagini/' + id);
  }

  apiGetListaImmaginiById(id: number): Observable<Immagini[]> {
    return this.http.get<Immagini[]>(this.constants.BasePath() + '/Attivita/get-lista-immagini/' + id);
  }

  apiGetAttivitaByIdAttivta(idAttivita: number): Observable<any> {
    this.language = this.languageService.getCurrentLanguage() || 'it';
    return this.http.get(this.constants.BasePath() + '/Attivita/get-attivita-by-id', {
      params: {
        idAttivita: idAttivita.toString(),
        lang: this.language. toUpperCase(),
      }
    });
  }

  apiGetAttivitaByIdSoggetto(): Observable<any> {
    this.language = this.languageService.getCurrentLanguage() || 'it';
  
    return this.http.get(
      this.constants.BasePath() + '/Attivita/get-lista-attivita-by-id',
      {
        params: {
          lang: this.language
        }
      }
    );
  }

  async apiGetListaDecAttivita(): Promise<Observable<TipoAttivita[]>> {
    this.language = this.languageService.getCurrentLanguage() || 'it';

    return this.http.get<TipoAttivita[]>(this.constants.BasePath() + '/Attivita/get-lista-tipoAttivita', {
      params:  {
        lang: this.language.toUpperCase()
      }
    })
  }

  apiGetAttivitaFavorite(): Observable<AttivitaRicerca[]> {
    this.language = this.languageService.getCurrentLanguage() || 'it';
    const params = new HttpParams()
      .set('lang', this.language.toUpperCase())
    return this.http.get<AttivitaRicerca[]>(this.constants.BasePath() + '/Attivita/get-favorites', { params });
  }

  apiGetListaTipoAttivitaById(id: number): Observable<TipoAttivita[]> {
    return this.http.get<TipoAttivita[]>(this.constants.BasePath() + '/Attivita/get-lista-tipoAttivita-by-id' + id);
  }

  async apiInsertAttivita(attivita: InsertAttivitaReqDto): Promise<InsertAttivitaResponse> {
    const lang = this.languageService.getCurrentLanguage() || 'it';
    return await firstValueFrom(
      this.http.post<InsertAttivitaResponse>(this.constants.BasePath() + `/Attivita/insert-attivita`, attivita, {
        params: {
          lang: lang. toUpperCase(),
        }
      })
    );
  }

  async apiUpdateAttivita(attivita: InsertAttivitaReqDto): Promise<any> {
    const lang = this.languageService.getCurrentLanguage() || 'it';
    return await firstValueFrom(
      this.http.post<InsertAttivitaReqDto>(this.constants.BasePath() + `/Attivita/update-attivita`, attivita, {
        params:  {
          lang: lang.toUpperCase(),
        }
      })
    );
  }

  /**
   * ✅ METODO PRINCIPALE AGGIORNATO CON CACHE
   * Recupera un'attività per ID e la salva nella lista "visualizzate di recente"
   */
  async apiGetAttivitaByIdAttivita(id: number | undefined): Promise<Attivita> {
    this.language = this.languageService.getCurrentLanguage() || 'it';
  
    const params:  any = {
      idAttivita: id?.toString() || '',
      lang: this.language. toUpperCase()
    };
  
    // Fai la GET normalmente
    const attivita = await firstValueFrom(
      this.http.get<Attivita>(this.constants.BasePath() + '/Attivita/get-attivita', {
        params:  params
      })
    );
  
    // ✅ Aggiorna la cache "attivita_recent_view"
    await this.addToRecentView(attivita);
  
    return attivita;
  }

  private async addToRecentView(attivita: Attivita): Promise<void> {
    try {
      const cachedData =
        (await this.cacheService.get<Attivita[]>(
          this.RECENT_VIEW_KEY,
          { category: this.RECENT_VIEW_CATEGORY }
        )) ?? [];
      
      // dedup
      const withoutDup = cachedData.filter(a => a.idAttivita !== attivita.idAttivita);
      
      // immagine principale (NON mutare l’oggetto originale se puoi)
      const immaginePrincipale = attivita.immagini?.find(
        img => (img.isImmaginePrincipale && img.isVerificata) || img.isImmaginePrincipaleTemp
      );
    
      const normalized: Attivita = {
        ...attivita,
        uploadImgPrincipale: immaginePrincipale?.upload ?? 'URL_IMMAGINE_FALLBACK',
      };
    
      const next = [normalized, ...withoutDup].slice(0, this.RECENT_VIEW_MAX_ITEMS);
    
      await this.cacheService.set(this.RECENT_VIEW_KEY, next, {
        category: this.RECENT_VIEW_CATEGORY,
        ttlMs: this.RECENT_VIEW_TTL,
        type: 'json',
      });
    } catch (error) {
      console.error('❌ Errore nell\'aggiornamento delle attività recenti:', error);
    }
  }

  async getRecentViewedActivities(): Promise<Attivita[]> {
    try {
      const cached = await this.cacheService.get<Attivita[]>(
        this.RECENT_VIEW_KEY,
        { category: this.RECENT_VIEW_CATEGORY }
      );
      return cached ?? [];
    } catch (error) {
      console.error('❌ Errore nel recupero delle attività recenti:', error);
      return [];
    }
  }

  async clearRecentView(): Promise<void> {
    await this.cacheService.remove(this.RECENT_VIEW_KEY, {
      category: this.RECENT_VIEW_CATEGORY
    });
  }

  async apiGetAttivitaAutocomplete(placeId: string): Promise<any> {
    this.language = this.languageService.getCurrentLanguage() || 'it';
    return await firstValueFrom(
      this.http.get(this.constants.BasePath() + '/Attivita/get-detail-attivita-autocomplete', {
        params: {
          placeId: placeId || '',
          lang: this.language.toUpperCase()
        }
      })
    );
  }

  createListAttivitaNewHomeSession(list: Attivita[]) {
    this.listaAttivitaNewHome = list;
  }
  
  createListaAttivitaPerRicercaSession(listaAttRicerca: AttivitaRicerca[]) {
    if (listaAttRicerca)
      this.listaAttivitaPerRicerca = listaAttRicerca;
  }
  
  GetListaAttivitaPerRicercaSession() {
    return this.listaAttivitaPerRicerca;
  }

  GetListaTipoAttivitaSession() {
    return this.listaTipoAttivita;
  }

  createListAttivitaPromoHomeSession(list: Attivita[]) {
    this.listaAttivitaPromoHome = list;
  }

  createListAttivitaVicineSession(list: Attivita[]) {
    this.listaAttivitaPromoHome = list;
  }

  createListCittaIconSession(list: string[]) {
    this.listaCitta = list;
  }

  getListAttivitaPromoHomeSession() {
    return this.listaAttivitaPromoHome;
  }

  getListAttivitaNewSession() {
    return this.listaAttivitaNewHome;
  }

  getListAttivitaVicineHomeSession() {
    return this.listaAttivitaVicine;
  }

  deleteSession() {
    this.attivitaSubject.next(null);
  }

  setListaAttivitaFiltrate(data: AttivitaFiltrate) {
    this.attivitaFiltrateResult = data;
  }

  setIsListaAttModalOpen(isOpen: boolean) {
    this.isListaAttModalOpen = isOpen;
  }

  setFilter(filtro: FiltriAttivita | undefined) {
    if (filtro)
      this.filter = filtro;
    else
      this.filter = undefined;
  }

  getFilter() {
    return this.filter;
  }

  getIsListaModalOpen() {
    return this.isListaAttModalOpen;
  }

  resetListaAttivitaFiltrate() {
    this.attivitaFiltrateResult = null;
  }

  getListaAttivita() {
    return this.attivitaFiltrateResult;
  }

  setlistaAttivitaDDL(listaTipoAttivita:  TipoAttivita[]) {
    listaTipoAttivita.sort((a, b) => {
      const descrizioneA = a.descrizione. toLowerCase();
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

  apiDeleteAttivita(idAttivita: number): Observable<number> {
    this.cacheService.clearCategory('api-cache');
    const attivita = new DeleteAttivita();
    attivita.idAttivita = idAttivita || 0;
    
    const options = {
      body:  attivita
    };
  
    return this.http.delete<number>(
      this.constants.BasePath() + '/Attivita/delete-attivita',
      options
    );
  }
}