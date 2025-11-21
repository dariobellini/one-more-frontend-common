import { AddressDto } from "../../AddressDto";
import { PhotoDto } from "../../PhotoDto";

export class ShopFastRecListDto {
    placeId?: string;
    title?: string;
    address?: AddressDto;
    photo?: PhotoDto;

    constructor(data?: Partial<ShopFastRecListDto>) {
        if (data) {
            this.placeId = data.placeId;
            this.title = data.title;
            this.address = data.address ? new AddressDto(data.address) : undefined;
            this.photo = data.photo ? new PhotoDto(data.photo) : undefined;
        }
    }
}