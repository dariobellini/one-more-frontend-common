import { Immagini } from "./Attivita";
import { TipologiaOfferta } from "./Promo";

export class CouponListDto {
    idCoupon : number;
    idPromo : number ;
    idSoggetto : number ;
    idAttivita: number ;
    titoloPromo: string ;
    displayName:string ;
    descPromo:string ;
    dataDal: Date ;
    dataAl:Date ;
    nome:string = '';
    indirizzo:string ;
    citta:string ;
    civico:string ;
    cap:string ;
    latitudine:number ;
    longitudine:number ;
    idStatus:number ;
    days: number[];
    isAllDayValidita:boolean;
    orarioValiditaDa:string;
    orarioValiditaAl:string;
    validDays: string;
    imgPrincipale: Immagini;
    tipologieOfferta:TipologiaOfferta[];
    timestamp:Date;
    

    constructor(    
    idCoupon : number,
    idPromo : number ,
    idSoggetto : number ,
    idAttivita: number ,
    titoloPromo: string ,
    displayName:string ,
    descPromo:string ,
    dataDal: Date ,
    dataAl:Date ,
    nome:string = '',
    indirizzo:string ,
    citta:string ,
    civico:string ,
    cap:string ,
    latitudine:number ,
    longitudine:number ,
    idStatus:number,
    days: number[],
    isAllDayValidita:boolean,
    orarioValiditaDa:string,
    orarioValiditaAl:string,
    validDays: string,
    imgPrincipale: Immagini,
    tipologieOfferta:TipologiaOfferta[],
    timestamp:Date) 
    {
      this.idCoupon = idCoupon;
      this.idPromo = idPromo;
      this.idSoggetto = idSoggetto;
      this.idAttivita = idAttivita;
      this.titoloPromo = titoloPromo;
      this.displayName = displayName;
      this.descPromo = descPromo;
      this.dataDal = dataDal;
      this.dataAl = dataAl;
      this.nome = nome;
      this.indirizzo = indirizzo;
      this.citta = citta;
      this.civico = civico;
      this.cap = cap;
      this.latitudine = latitudine;
      this.longitudine = longitudine;
      this.idStatus = idStatus;
      this.days = days;
      this.isAllDayValidita = isAllDayValidita,
      this.orarioValiditaAl = orarioValiditaAl,
      this.orarioValiditaDa = orarioValiditaDa,
      this.validDays = validDays,
      this.imgPrincipale = imgPrincipale,
      this.tipologieOfferta = tipologieOfferta,
      this.timestamp = timestamp
    }
}