export class CouponUpdateReqDto {
    couponId!: number;
    idStatus!: number;
    userId!: number;

    constructor(data?: Partial<CouponUpdateReqDto>) {
        if (data) {
            this.couponId = data.couponId!;
            this.idStatus = data.idStatus!;
            this.userId = data.userId!;
        }
    }
}
