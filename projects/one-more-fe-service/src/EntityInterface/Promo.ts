import { DecimalPipe } from "@angular/common";

export class Promo {
  idPromo:number ;
  idAttivita:number ;
  descPromo:string ;
  dataInserimento:Date ;
  dataDal:Date ;
  dataAl:Date ;
  validDays:string ;
  days:number[] ;
  isAllDayValidita:boolean ;
  orarioValiditaDa:string ;
  orarioValiditaAl:string ;
  listaTipologie:TipologiaOfferta[] ;
  numUtilizziPerPersonaMax:number ;
  numCouponRichiesti:number ;
  numCouponUtilizzati:number ;
  numCouponRimanenti:number ;
  numCouponAnnullati:number ;
  numCouponMax:number ;
  isAttiva:boolean ;
  titoloPromo:string ;
  isAbilitataForUser:boolean ;
  motivazioneDisabilitata: string ;
  periodo:string ;
  descrizioniPeriodi:string ;
  codTipoConsumazione: number;
  descTipoConsumazione:string ;

constructor(idPromo:number ,
  idAttivita:number ,
  descPromo:string ,
  dataInserimento:Date ,
  dataDal:Date ,
  dataAl:Date ,
  validDays:string ,
  days:number[] ,
  isAllDayValidita:boolean ,
  orarioValiditaDa:string ,
  orarioValiditaAl:string ,
  listaTipologie:TipologiaOfferta[] ,
  numUtilizziPerPersonaMax:number ,
  numCouponRichiesti:number ,
  numCouponUtilizzati:number ,
  numCouponRimanenti:number ,
  numCouponAnnullati:number ,
  numCouponMax:number ,
  isAttiva:boolean ,
  titoloPromo:string ,
  isAbilitataForUser:boolean ,
  motivazioneDisabilitata: string,
  periodo:string,
  descrizioniPeriodi:string,
  codTipoConsumazione: number,
  descTipoConsumazione:string
  ) {
    this.idAttivita = idAttivita;
    this.idPromo = idPromo;
    this.descPromo = descPromo;
    this.dataInserimento = dataInserimento;
    this.dataDal = dataDal;
    this.dataAl = dataAl;
    this.validDays = validDays;
    this.days = days;
    this.isAllDayValidita = isAllDayValidita;
    this.orarioValiditaDa = orarioValiditaDa;
    this.orarioValiditaAl = orarioValiditaAl;
    this.listaTipologie = listaTipologie;
    this.numUtilizziPerPersonaMax = numUtilizziPerPersonaMax;
    this.numCouponAnnullati = numCouponAnnullati;
    this.numCouponRichiesti = numCouponRichiesti;
    this.numCouponUtilizzati = numCouponUtilizzati;
    this.numCouponRimanenti = numCouponRimanenti;
    this.numCouponMax = numCouponMax;
    this.isAttiva = isAttiva;
    this.titoloPromo = titoloPromo;
    this.isAbilitataForUser = isAbilitataForUser;
    this.motivazioneDisabilitata = motivazioneDisabilitata;
    this.periodo = periodo;
    this.descrizioniPeriodi = descrizioniPeriodi;
    this.codTipoConsumazione = codTipoConsumazione;
    this.descTipoConsumazione = descTipoConsumazione;
}
}

export class InsertPromoReqDto {
idPromo:number | undefined;
idAttivita:number | undefined;
descPromo:string | undefined;
dataDal:Date | undefined;
dataAl:Date | undefined;
validDays:string | undefined;
days:number[] | undefined;
isAllDayValidita:boolean | undefined;
orarioValiditaDa:string | undefined;
orarioValiditaAl:string | undefined;
listaTipologie:TipologiaOfferta[] | undefined;
numUtilizziPerPersonaMax:number | undefined;
isRinnovoUtilizzo:boolean | undefined;
numCouponMax:number | undefined;
isAttiva:boolean | undefined;
titoloPromo:string | undefined;  
periodo:string | undefined;
descrizioniPeriodi:string | undefined;
codTipoConsumazione: number | undefined;
descTipoConsumazione:string | undefined;
}

export class EsitoInsertPromo{
  idPromo:number | undefined;
  message:string | undefined;
  promo:Promo | undefined;
}

export class GiorniSettimanaPromo{
  days:number[] | undefined;
}

export class TipologiaOfferta{
codTipologia:number | undefined;
descrizione:string | undefined;
}

export class InsertPromoUserAttiva{
idPromo: number | undefined;
idSoggetto: number | undefined;
dataAcquisizione:Date | undefined;
}

export class InsertCouponResponse {
  codice: string | undefined;
  descrizione: string | undefined;
}

export class PromoUserAttive
{
idPromo: number | undefined;
idAttivita: number | undefined;
idSoggetto: number | undefined;
titoloPromo: string | undefined;
descPromo:string | undefined;
dataDal: Date | undefined;
dataAl: Date | undefined;
ValidDays:string | undefined;
days:number[] | undefined;
isAllDayValidita:boolean | undefined;
orarioValiditaDa:string | undefined;
orarioValiditaAl:string | undefined;
isAttiva:boolean | undefined;
dataAcquisizione:Date | undefined;
listaTipologie: TipologiaOfferta[] | undefined;
periodo:string | undefined;
descrizioniPeriodi:string | undefined;
codTipoConsumazione: number | undefined;
descTipoConsumazione:string | undefined;
}

export class PromoUserUtilizzate
{
  idPromo: number | undefined;
  idSoggetto: number | undefined;
  dataAcquisizione:Date | undefined;
  titoloPromo: string | undefined;
  descPromo: string | undefined;
  periodo:string | undefined;
  descrizioniPeriodi:string | undefined;
  codTipoConsumazione: number | undefined;
  descTipoConsumazione:string | undefined;
}

export class PromoUser
{
  listaPromoAttive: PromoUserAttive[] | undefined;
  listaPromoUtilizzate: PromoUserUtilizzate[] | undefined;
}

export class PromoUserAnnullate
{
  idPromo: number | undefined;
  idAttivita: number | undefined;
  dataAcquisizione: Date | undefined;
  dataAnnullamento: Date | undefined;
  codAnnullamento: string | undefined;
  descMotivazione: string | undefined;
  periodo:string | undefined;
  descrizioniPeriodi:string | undefined;
  codTipoConsumazione: number | undefined;
  descTipoConsumazione:string | undefined;
}