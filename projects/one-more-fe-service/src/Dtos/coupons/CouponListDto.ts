import { CouponDto } from "./CouponDto";

export class CouponListDto extends CouponDto {
    shopId!: number;
    shopTitle!: string;
    promoTitle!: string;
    photoFileName?: string;
    promoEndDate?: Date;

    constructor(data?: Partial<CouponListDto>) {
        super(data);
    }
}
