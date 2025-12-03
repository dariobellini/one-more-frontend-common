export class CouponAddReqDto {
    shopId!: number;
    promoId!: number;

    constructor(data?: Partial<CouponAddReqDto>) {
        if (data) {
            this.shopId = data.shopId!;
            this.promoId = data.promoId!;
        }
    }
}
