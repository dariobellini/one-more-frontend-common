export class GenericSearchReqDto {
  cityCode?: string;
  idShopType?: number;
  idPromoDays?: number[];
  idPromoPeriod?: number;
  idPromoTypes?: number[];
  idPromoCategory?: number;

  constructor(init?: Partial<GenericSearchReqDto>) {
    Object.assign(this, init);
  }
}