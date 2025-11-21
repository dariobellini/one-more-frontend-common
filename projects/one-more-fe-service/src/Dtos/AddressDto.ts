export class AddressDto {
    street: string;
    streetNumber: string;
    city: string;
    zipCode: string;

    constructor(data: AddressDto) {
        this.street = data.street;
        this.streetNumber = data.streetNumber;
        this.city = data.city;
        this.zipCode = data.zipCode;
    }
}
