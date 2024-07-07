import { DecimalPipe } from "@angular/common";

export class Promo {
idPromo:number;
idAttivita:number;
descPromo:string;
dataInserimento:Date;
dataDal:Date;
dataAl:Date;
validDays:string;
days:number[];
isAllDayValidita:boolean;
orarioValiditaDa:string;
orarioValiditaAl:string;
listaTipologie:TipologiaOfferta[];
numUtilizziPerPersonaMax:number;
numCouponRichiesti:number;
numCouponUtilizzati:number;
numCouponRimanenti:number;
numCouponAnnullati:number;
numCouponMax:number;
isAttiva:boolean;
titoloPromo:string;
isAbilitataForUser:boolean;
motivazioneDisabilitata: string;
}

export class InsertPromoReqDto {
idPromo:number;
idAttivita:number;
descPromo:string;
dataDal:Date;
dataAl:Date;
validDays:string;
days:number[];
isAllDayValidita:boolean;
orarioValiditaDa:string;
orarioValiditaAl:string;
listaTipologie:TipologiaOfferta[];
numUtilizziPerPersonaMax:number;
isRinnovoUtilizzo:boolean;
numCouponMax:number;
isAttiva:boolean;
titoloPromo:string;    
}

export class GiorniSettimanaPromo{
  days:number[];
}

export class TipologiaOfferta{
codTipologia:number;
descrizione:string;
}

export class InsertPromoUserAttiva{
idPromo: number;
idSoggetto: number;
dataAcquisizione:Date;
}

export class PromoUserAttive
{
idPromo: number;
idAttivita: number;
idSoggetto: number;
titoloPromo: string;
descPromo:string;
dataDal: Date;
dataAl: Date;
ValidDays:string;
days:number[];
isAllDayValidita:boolean;
orarioValiditaDa:string;
orarioValiditaAl:string;
isAttiva:boolean;
dataAcquisizione:Date;
listaTipologie: TipologiaOfferta[];
}

export class PromoUserUtilizzate
{
idPromo: number;
idSoggetto: number;
dataAcquisizione:Date;
titoloPromo: string;
descPromo: string;
}

export class PromoUser
{
listaPromoAttive: PromoUserAttive[];
listaPromoUtilizzate: PromoUserUtilizzate[];
}

export class PromoUserAnnullate
{
idPromo: number;
idAttivita: number;
dataAcquisizione: Date;
dataAnnullamento: Date;
codAnnullamento: string;
descMotivazione: string;
}
