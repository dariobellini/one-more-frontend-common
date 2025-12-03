export class SearchItemDto{
  id: string;
  description: string;
  type: searchItemType

  constructor(id: string, description: string, type: searchItemType) {
    this.id = id;
    this.description = description;
    this.type = type;
  }
}

export enum searchItemType{
  Shop = 1,
  ShopType = 2,
  Promo = 3
}
