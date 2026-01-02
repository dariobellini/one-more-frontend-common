import { AddressDto } from "../../AddressDto";
import { PhotoFormDto } from "../../FastRecDtos/PhotoFormDto";
import { HourDto } from "../../HourDto";
import { OfferTypeDto } from "../../OfferTypeDto";
import { ShopDetailDto } from "../../ShopDetail";
import { ShopTypeDto } from "../../ShopTypeDto";

export interface ShopRecDetailDto {
        id: number;
        title: string;
        address: AddressDto;
        hours: HourDto[];
        offerType: OfferTypeDto;
        detail: ShopDetailDto;
        types: ShopTypeDto[];
        photos: PhotoFormDto[];
}