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

export class SearchItemDtoRequest{
  latitude: number | undefined;
  longitude: number | undefined;
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
