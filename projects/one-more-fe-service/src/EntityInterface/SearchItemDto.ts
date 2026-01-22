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

export class SearchItemDtoRequest{
  city: string | undefined;
  idShopType: number | undefined;
  idPromoDays: number[] | undefined;
  idPromoPeriod: number | undefined;
  idPromoTypes: number[] | undefined;
  idPromoCategory: number | undefined;
}

export enum searchItemType{
  Shop = 1,
  ShopType = 2,
  Promo = 3
}
