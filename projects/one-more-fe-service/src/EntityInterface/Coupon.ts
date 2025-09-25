
export class Coupon {
    Id: number;
    IdAttivita: number;
    IdPromo: number;
    IdSoggetto: number;

    constructor(idPromo: number, IdAttivita: number, idSoggetto: number) {
        this.Id = 0;
        this.IdAttivita = IdAttivita,
        this.IdPromo = idPromo,
        this.IdSoggetto = idSoggetto
    }
}

export class StatusCouponUser {
    idCoupon: number;
    idStatus: number;

    constructor(idCoupon: number, idStatus: number) {
        this.idCoupon = idCoupon
        this.idStatus = idStatus
    }
}

export class StatusCoupon {
    idCoupon!: number;
    idStatus!: number;
    idSoggetto!: number;

    constructor(idCoupon: number, idStatus: number, idSoggetto: number) {
        this.idCoupon = idCoupon
        this.idStatus = idStatus
        this.idSoggetto = idSoggetto
    }
}