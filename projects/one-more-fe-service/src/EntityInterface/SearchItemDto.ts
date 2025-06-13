export class SearchItemDto{
  id: number;
  descrizione: string;
  type: searchItemType

  constructor(id: number, descrizione: string, type: searchItemType) {
    this.id = id;
    this.descrizione = descrizione;
    this.type = type;
  }
}

export enum searchItemType{
  Shop = 1,
  Promo = 2
}
