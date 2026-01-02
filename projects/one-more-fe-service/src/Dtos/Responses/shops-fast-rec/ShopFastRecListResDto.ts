import { AddressDto } from "../../AddressDto";
import { PhotoFormDto } from "../../FastRecDtos/PhotoFormDto";

export class ShopFastRecResListDto {
    placeId?: string;
    title?: string;
    address?: AddressDto;
    photo?: PhotoFormDto;

    constructor(data?: Partial<ShopFastRecResListDto>) {
        if (data) {
            this.placeId = data.placeId;
            this.title = data.title;
            this.address = data.address ? new AddressDto(data.address) : undefined;
            this.photo = data.photo ? new PhotoFormDto(data.photo) : undefined;
        }
    }
}