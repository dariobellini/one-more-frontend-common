export class CouponDto {
    id!: number;
    promoId!: number;
    userId!: number;
    statusId!: number;
    jwt!: string;
    insertTime?: Date;
    updateTime?: Date;

    constructor(data?: Partial<CouponDto>) {
        if (data) {
            this.id = data.id!;
            this.promoId = data.promoId!;
            this.userId = data.userId!;
            this.statusId = data.statusId!;
            this.jwt = data.jwt!;
            this.insertTime = data.insertTime;
            this.updateTime = data.updateTime;
        }
    }
}
