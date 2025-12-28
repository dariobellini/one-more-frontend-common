import { PromoListDto } from "../PromoListDto";
import { CouponDto } from "./CouponDto";

export class CouponListDto  extends CouponDto
  {
    shopId!: number;
    shopTitle!: string;
    promoTitle!: string;
    photoFileName?: string;
    promoEndDate?: Date;


    constructor(data?: Partial<CouponListDto>) {
      if(data){
        super(data);
        this.shopId = data.shopId!;
        this.shopTitle = data.shopTitle!;
        this.promoTitle = data.promoTitle!;
        this.photoFileName = data.photoFileName!;
        this.promoEndDate = data.promoEndDate!;
        }
    }
}
