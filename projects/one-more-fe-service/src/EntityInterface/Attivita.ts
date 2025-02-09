export class Attivita {
  idAttivita:number;
  idSoggetto:number;
  nome:string;
  indirizzo:string;
  citta:string;
  provincia:string;
  civico:string;
  cap:string;
  latitudine:number;
  longitudine:number;
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
  isVerificata:boolean;
  esitoVerifica:boolean;
  motivo:string;
  distanza: string;
  affidabilita:number;
  hasCoupon:boolean;

  constructor(
    idAttivita:number,
    idSoggetto:number,
    nome:string,
    indirizzo:string,
    citta:string,
    provincia:string,
    civico:string,
    cap:string,
    latitudine:number,
    longitudine:number,
    telefono:string,
    cellulare:string,
    isCellPubblico:boolean,
    email:string,
    descrizione:string,
    descrizioneOfferta:string,
    isPromoPresente:boolean,
    isOffertaVegetariana:boolean,
    isOffertaVegana:boolean,
    isOffertaNoGlutine:boolean,
    listaTipoAttivita:TipoAttivita[],
    orari:Orari,
    immagini:Immagini[],
    isVerificata:boolean,
    esitoVerifica:boolean,
    motivo:string,
    distanza:string,
    affidabilita:number,
    hasCoupon:boolean
  ) 
  {
    this.idAttivita = idAttivita,
    this.idSoggetto = idSoggetto,
    this.nome = nome,
    this.indirizzo = indirizzo,
    this.citta = citta,
    this.provincia = provincia,
    this.civico = civico,
    this.cap = cap,
    this.latitudine = latitudine,
    this.longitudine = longitudine,
    this.telefono = telefono,
    this.cellulare = cellulare,
    this.isCellPubblico = isCellPubblico,
    this.email = email,
    this.descrizione = descrizione,
    this.descrizioneOfferta = descrizioneOfferta,
    this.isPromoPresente = isPromoPresente,
    this.isOffertaVegetariana = isOffertaVegetariana,
    this.isOffertaVegana = isOffertaVegana,
    this.isOffertaNoGlutine = isOffertaNoGlutine,
    this.listaTipoAttivita = listaTipoAttivita,
    this.orari = orari,
    this.immagini = immagini,
    this.isVerificata = isVerificata,
    this.esitoVerifica = esitoVerifica,
    this.motivo = motivo,
    this.distanza = distanza,
    this.affidabilita = affidabilita,
    this.hasCoupon = hasCoupon
  }

}

export class AttivitaRicerca {
  idAttivita:number;
  nome:string;
  indirizzo:string;
  citta:string;
  provincia:string;
  civico:string;
  cap:string;
  latitudine:number;
  longitudine:number;
  isPromoPresente:boolean;
  listaTipoAttivita:TipoAttivita[];
  immagini:Immagini[];
  isVerificata:boolean;
  esitoVerifica:boolean;
  
  constructor( idAttivita:number,
    nome:string,
    indirizzo:string,
    citta:string,
    provincia:string,
    civico:string,
    cap:string,
    latitudine:number,
    longitudine:number,
    isPromoPresente:boolean,
    listaTipoAttivita:TipoAttivita[],
    immagini:Immagini[],
    isVerificata:boolean,
    esitoVerifica:boolean
  ) 
    
    {
      this.idAttivita = idAttivita;
      this.nome = nome;
      this.indirizzo = indirizzo;
      this.citta = citta;
      this.provincia = provincia;
      this.civico = civico;
      this.cap = cap;
      this.latitudine = latitudine;
      this.longitudine = longitudine;
      this.isPromoPresente = isPromoPresente;
      this.listaTipoAttivita = listaTipoAttivita;
      this.immagini = immagini;
      this.isVerificata = isVerificata;
      this.esitoVerifica = esitoVerifica;
  }
}

export class InsertAttivitaReqDto {
  idAttivita:number;
  idSoggetto:number ;
  nome:string ;
  indirizzo:string ;
  citta:string ;
  provincia:string ;
  civico:string ;
  cap:string ;
  telefono:string ;
  cellulare:string ;
  isCellPubblico:boolean ;
  email:string ;
  descrizione:string ;
  descrizioneOfferta:string ;
  isPromoPresente:boolean ;
  isOffertaVegetariana:boolean ;
  isOffertaVegana:boolean ;
  isOffertaNoGlutine:boolean ;
  listaTipoAttivita:TipoAttivita[] = [];
  orari:Orari ;
  immagini:Immagini[];
  isVerificata:boolean;
  esitoVerifica:boolean;

  constructor(
    idAttivita:number ,
    idSoggetto:number ,
    nome:string ,
    indirizzo:string ,
    citta:string ,
    provincia:string ,
    civico:string ,
    cap:string ,
    telefono:string ,
    cellulare:string ,
    isCellPubblico:boolean ,
    email:string ,
    descrizione:string ,
    descrizioneOfferta:string ,
    isPromoPresente:boolean ,
    isOffertaVegetariana:boolean ,
    isOffertaVegana:boolean ,
    isOffertaNoGlutine:boolean ,
    listaTipoAttivita:TipoAttivita[] = [],
    orari:Orari ,
    immagini:Immagini[],
    isVerificata: boolean,
    esitoVerifica: boolean) 
    {
      this.idAttivita = idAttivita,
      this.idSoggetto = idSoggetto,
      this.nome = nome,
      this.indirizzo = indirizzo,
      this.citta = citta,
      this.provincia = provincia,
      this.civico = civico,
      this.cap = cap,
      this.telefono = telefono,
      this.cellulare = cellulare,
      this.isCellPubblico = isCellPubblico,
      this.email = email,
      this.descrizione = descrizione,
      this.descrizioneOfferta = descrizioneOfferta,
      this.isPromoPresente = isPromoPresente,
      this.isOffertaVegana = isOffertaVegana,
      this.isOffertaVegetariana = isOffertaVegetariana,
      this.isOffertaNoGlutine = isOffertaNoGlutine,
      this.listaTipoAttivita =listaTipoAttivita,
      this.orari = orari,
      this.immagini = immagini,
      this.isVerificata = isVerificata,
      this.esitoVerifica = esitoVerifica
  }
}

export class InsertAttivitaResDto {
  idAttivita:number ;

  constructor(idAttivita : number) {
    this.idAttivita = idAttivita;
  }
}

export class TipoAttivita {
  codTipoAttivita:string ;
  descrizione:string ;

  constructor(codTipoAttivita:string, descrizione:string) {
    this.codTipoAttivita = codTipoAttivita;
    this.descrizione = descrizione;
  }
}

export class Orari {
  lunediMatDa:string;
  lunediMatAl:string;
  lunediPomDa:string ;
  lunediPomAl:string ;
  martediMatDa:string ;
  martediMatAl:string ;
  martediPomDa:string ;
  martediPomAl:string ;
  mercolediMatDa:string ;
  mercolediMatAl:string ;
  mercolediPomDa:string ;
  mercolediPomAl:string ;
  giovediMatDa:string ;
  giovediMatAl:string ;
  giovediPomDa:string ;
  giovediPomAl:string ;
  venerdiMatDa:string ;
  venerdiMatAl:string ;
  venerdiPomDa:string ;
  venerdiPomAl:string ;
  sabatoMatDa:string ;
  sabatoMatAl:string ;
  sabatoPomDa:string ;
  sabatoPomAl:string ;
  domenicaMatDa:string ;
  domenicaMatAl:string ;
  domenicaPomDa:string ;
  domenicaPomAl:string ;

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
  descrizioneLocale : string ;
  menu : string ;

  constructor( 
    descrizioneLocale : string,
    menu : string ) {
    this.descrizioneLocale = descrizioneLocale;
    this.menu = menu;
  }
}

export class Immagini{
  idImmagine : number ;
  idAttivita : number;
  nomeUpload : string;
  upload : string;
  isImmaginePrincipale : boolean;
  isImmaginePrincipaleTemp : boolean;
  ordinamento : number;
  isVerificata : boolean;

  constructor( 
    idImmagine : number ,
    idAttivita : number,
    nomeUpload : string,
    upload : string,
    isImmaginePrincipale : boolean,
    isImmaginePrincipaleTemp : boolean,
    ordinamento : number,
    isVerificata : boolean
  ) {
    this.idImmagine =idImmagine;
    this.idAttivita = idAttivita;
    this.nomeUpload = nomeUpload;
    this.upload = upload;
    this.isImmaginePrincipale = isImmaginePrincipale;
    this.isImmaginePrincipaleTemp = isImmaginePrincipaleTemp;
    this.ordinamento = ordinamento;
    this.isVerificata = isVerificata;
  }
}

export class AttivitaHomePageResponse
{
    listUltimeAttReg : Attivita [] ;
    listAttivitaWithPromo : Attivita [] ;
    listNearbyAttivita : Attivita [];
    listCitta : string [];

    constructor( listUltimeAttReg : Attivita [],
      listAttivitaWithPromo : Attivita [],
      listNearbyAttivita : Attivita [],
      listCitta : string [] ) {
        this.listAttivitaWithPromo = listAttivitaWithPromo;
        this.listUltimeAttReg = listUltimeAttReg;
        this.listNearbyAttivita = listNearbyAttivita;
        this.listCitta = listCitta
    }
}

export class FiltriAttivita {
  latitudine: number |undefined;
  longitudine: number |undefined;
  isPromoPresente: boolean |undefined;
  citta: string |undefined;
  provincia: string |undefined;
  nome: string |undefined;
  indirizzo: string |undefined;
  dataFinePromo: Date |undefined;
  isLunedi: boolean |undefined;
  isMartedi: boolean |undefined;
  isMercoledi: boolean |undefined;
  isGiovedi: boolean |undefined;
  isVenerdi: boolean |undefined;
  isSabato: boolean |undefined;
  isDomenica: boolean |undefined;
  isAllDayValidita: boolean |undefined;
  orarioValiditaDa: string |undefined;
  orarioValiditaAl: string |undefined;
  codTipoAttivita: string |undefined;
  codTipoPromo: number[] |undefined;
  isMovingMap: boolean | undefined;
  range: number = 0;
  isHomePage: boolean | undefined;
  typeFilterHomePage: number | undefined;
}

export class AttivitaFiltrate
{
    listaAttivita: Attivita [] ;
    latitudine:number ;
    longitudine:number ;
    errore :string ;

    constructor(  
      listaAttivita: Attivita [] ,
      latitudine:number ,
      longitudine:number ,
      errore:string) 
      {
      this.listaAttivita = listaAttivita,
      this.latitudine = latitudine
      this.longitudine = longitudine,
      this.errore = errore
      }
}

export class DeleteAttivita {
  idAttivita :number = 0;
  idSoggetto :number = 0;
}