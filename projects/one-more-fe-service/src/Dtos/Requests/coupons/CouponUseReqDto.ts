export class CouponUseReqDto {
    jwt!: string;

    constructor(data?: Partial<CouponUseReqDto>) {
        if (data) {
            this.jwt = data.jwt!;
        }
    }
}
