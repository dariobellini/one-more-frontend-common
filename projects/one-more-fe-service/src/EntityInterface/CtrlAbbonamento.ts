import { DecimalPipe } from "@angular/common";

export interface CtrlAbbonamento{
  CodAbbonamento:string;
  DescAbbonamento:string;
  Prezzo:DecimalPipe;
  MesiPeriodoValidita:number;
  IsPromo:boolean;
}
