export class StaffDto {
    email: string;
    name: string | undefined;
    canManagePromos: boolean;
    canValidateCoupons: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: StaffDto) {
        this.email = data.email;
        this.name = data.name;
        this.canManagePromos = data.canManagePromos;
        this.canValidateCoupons = data.canValidateCoupons;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}