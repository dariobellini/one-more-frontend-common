export class SearchItemDto{
  id: string;
  descrizione: string;
  type: searchItemType

  constructor(id: string, descrizione: string, type: searchItemType) {
    this.id = id;
    this.descrizione = descrizione;
    this.type = type;
  }
}

export enum searchItemType{
  Shop = 1,
  ShopType = 2,
  Promo = 3
}
