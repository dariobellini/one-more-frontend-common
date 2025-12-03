import { PromoListDto } from "../PromoListDto";
import { CouponDto } from "./CouponDto";

export class CouponListDto {
    coupon!: CouponDto;
    promo!: PromoListDto;

    constructor(data?: Partial<CouponListDto>) {
        if (data) {
            this.coupon = data.coupon!;
            this.promo = data.promo!;
        }
    }
}
