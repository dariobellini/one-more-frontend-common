import { DecimalPipe } from "@angular/common";

export class Attivita {
  idAttivita:number;
  idSoggetto:number;
  nome:string = '';
  indirizzo:string;
  citta:string;
  provincia:string;
  civico:string;
  cap:string;
  latitudine:number;
  longitudine:number;
  telefono:string = '';
  cellulare:string;
  isCellPubblico:boolean;
  email:string;
  descrizione:string;
  descrizioneOfferta:string;
  isPromoPresente:boolean;
  isOffertaVegetariana:boolean;
  isOffertaVegana:boolean;
  isOffertaNoGlutine:boolean;
  listaTipoAttivita:TipoAttivita[];
  orari:Orari;
  immagini:Immagini[];
  
}

export class InsertAttivitaReqDto {
  idSoggetto:number;
  nome:string;
  indirizzo:string;
  citta:string;
  provincia:string;
  civico:string;
  cap:string;
  telefono:string;
  cellulare:string;
  isCellPubblico:boolean;
  email:string;
  descrizione:string;
  descrizioneOfferta:string;
  isPromoPresente:boolean;
  isOffertaVegetariana:boolean;
  isOffertaVegana:boolean;
  isOffertaNoGlutine:boolean;
  listaTipoAttivita:TipoAttivita[];
  orari:Orari;
  immagini:Immagini[];
}

export class TipoAttivita {
  codTipoAttivita:string;
  descrizione:string;
}

export class Orari {
  lunediMatDa:string;
  lunediMatAl:string;
  lunediPomDa:string;
  lunediPomAl:string;
  martediMatDa:string;
  martediMatAl:string;
  martediPomDa:string;
  martediPomAl:string;
  mercolediMatDa:string;
  mercolediMatAl:string;
  mercolediPomDa:string;
  mercolediPomAl:string;
  giovediMatDa:string;
  giovediMatAl:string;
  giovediPomDa:string;
  giovediPomAl:string;
  venerdiMatDa:string;
  venerdiMatAl:string;
  venerdiPomDa:string;
  venerdiPomAl:string;
  sabatoMatDa:string;
  sabatoMatAl:string;
  sabatoPomDa:string;
  sabatoPomAl:string;
  domenicaMatDa:string;
  domenicaMatAl:string;
  domenicaPomDa:string;
  domenicaPomAl:string;

  constructor()
  {
  this.lunediMatDa = '';
  this.lunediMatAl = '';
  this.lunediPomDa = '';
  this.lunediPomAl = '';
  this.martediMatDa = '';
  this.martediMatAl = '';
  this.martediPomDa = '';
  this.martediPomAl = '';
  this.mercolediMatDa = '';
  this.mercolediMatAl = '';
  this.mercolediPomDa = '';
  this.mercolediPomAl = '';
  this.giovediMatDa = '';
  this.giovediMatAl = '';
  this.giovediPomDa = '';
  this.giovediPomAl = '';
  this.venerdiMatDa = '';
  this.venerdiMatAl = '';
  this.venerdiPomDa = '';
  this.venerdiPomAl = '';
  this.sabatoMatDa = '';
  this.sabatoMatAl = '';
  this.sabatoPomDa = '';
  this.sabatoPomAl = '';
  this.domenicaMatDa = '';
  this.domenicaMatAl = '';
  this.domenicaPomDa = '';
  this.domenicaPomAl = '';
  }
}

export class Descrizione{
  descrizioneLocale : string;
  menu : string;
}

export class Immagini{
  idImmagine : number | null;
  idAttivita : number | null;
  nomeUpload : string;
  upload : string;
  isImmaginePrincipale : boolean | null;
  ordinamento : number | null;
}

export class AttivitaHomePageResponse
{
    listUltimeAttReg : Attivita []
    listAttivitaWithPromo : Attivita []
}

export class AttivitaSession {
  constructor(
    public idAttivita:number,
    public idSoggetto:number,
    public nome:string,
    public indirizzo:string,
    public citta:string,
    public provincia:string,
    public civico:string,
    public cap:string,
    public latitudine:number,
    public longitudine:number,
    public telefono:string,
    public cellulare:string,
    public isCellPubblico:boolean,
    public email:string,
    public descrizione:string,
    public descrizioneOfferta:string,
    public isPromoPresente:boolean,
    public isOffertaVegetariana:boolean,
    public isOffertaVegana:boolean,
    public isOffertaNoGlutine:boolean,
    public listaTipoAttivita:TipoAttivita[],
    public orari:Orari,
    public immagini:Immagini[]
  ){}
}

export class FiltriAttivita {
  tipoRicerca: number;
  latitudine: number;
  longitudine: number;
  isPromoPresente: boolean;
  citta: string;
  provincia: string;
  nome: string;
  indirizzo: string;
  dataFinePromo: Date;
  isLunedi: boolean;
  isMartedi: boolean;
  isMercoledi: boolean;
  isGiovedi: boolean;
  isVenerdi: boolean;
  isSabato: boolean;
  isDomenica: boolean;
  isAllDayValidita: boolean;
  orarioValiditaDa: string;
  orarioValiditaAl: string;
  codTipoAttivita: string | undefined;
  codTipoPromo: number;
}

export class AttivitaFiltrate
{
    listaAttivita: Attivita []
    latitudine:number;
    longitudine:number;
    errore:string;
}

