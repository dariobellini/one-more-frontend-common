import { AddressDto } from "../../AddressDto";
import { AddUpdatePhotoDto } from "../../FastRecDtos/AddUpdatePhotoDto";

export class ShopFastRecResListDto {
    placeId?: string;
    title?: string;
    address?: AddressDto;
    photo?: AddUpdatePhotoDto;

    constructor(data?: Partial<ShopFastRecResListDto>) {
        if (data) {
            this.placeId = data.placeId;
            this.title = data.title;
            this.address = data.address ? new AddressDto(data.address) : undefined;
            this.photo = data.photo ? new AddUpdatePhotoDto(data.photo) : undefined;
        }
    }
}