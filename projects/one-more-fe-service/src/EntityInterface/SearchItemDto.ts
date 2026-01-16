export class SearchItemDto{
  id: string;
  title: string;
  description: string;
  type: searchItemType;

  constructor(id: string, title: string, description: string, type: searchItemType) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
  }
}

export enum searchItemType{
  Shop = 1,
  ShopType = 2,
  Promo = 3
}
