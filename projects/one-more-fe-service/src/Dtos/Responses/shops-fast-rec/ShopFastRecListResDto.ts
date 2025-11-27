import { AddressDto } from "../../AddressDto";
import { BytesPhotoDto } from "../../FastRecDtos/BytesPhotoDto";

export class ShopFastRecResListDto {
    placeId?: string;
    title?: string;
    address?: AddressDto;
    photo?: BytesPhotoDto;

    constructor(data?: Partial<ShopFastRecResListDto>) {
        if (data) {
            this.placeId = data.placeId;
            this.title = data.title;
            this.address = data.address ? new AddressDto(data.address) : undefined;
            this.photo = data.photo ? new BytesPhotoDto(data.photo) : undefined;
        }
    }
}