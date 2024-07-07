import { DecimalPipe } from "@angular/common";

export class Soggetto {
  idSoggetto:number;
  nome:string;
  cognome:string;
  codFiscale:string;
  dataNascita:Date;
  telefono:string;
  cellulare:string;
  email:string;
  indirizzo:string;
  isPromoAttiva:boolean;
}

export class InsertSoggettoReqDto {
  idSoggetto:number;
  nome:string;
  cognome:string;
  dataNascita:Date;
  cellulare:string;
  email:string;
}

