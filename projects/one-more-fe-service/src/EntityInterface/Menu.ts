
export class Menu {
  idMenu:bigint;
  IdAttivita:bigint;
  codTipologiaMenu:string;
  nomeMenu:string;
  descrizione:string;
  DataRinnovo:Date;
}

export class Prodotto {
  idProdotto: bigint;
  idMenu: bigint;
  codProdotto:string;
  isVegetariano:boolean;
  isVegano:boolean;
  descrizione:string;
}

export class Dec_TipologiaMenu {
  codTipologiaMenu:string;
  descTipologiaMenu:string;
}
