export class AddressDto {
    street?: string;
    streetNumber?: string;
    city?: string;
    zipCode?: string;
    country?: string;

    constructor(data?: Partial<AddressDto>) {
        if (data) {
            this.street = data.street;
            this.streetNumber = data.streetNumber;
            this.city = data.city;
            this.zipCode = data.zipCode;
            this.country = data.country;
        }
    }
}