import { PromoListDto } from "../PromoListDto";
import { CouponDto } from "./CouponDto";

export class CouponListDto
//  extends CouponDto
  {
    // shopId!: number;
    // shopTitle!: string;
    // promoTitle!: string;
    // photoFileName?: string;
    // promoEndDate?: Date;
    coupon!: CouponDto;
    promo!: PromoListDto;


    constructor(data?: Partial<CouponListDto>) {
        // super(data);
        if(data){
        this.coupon = data.coupon!;
        this.promo = data.promo!;
        }
    }
}
