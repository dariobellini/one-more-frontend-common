import { AddressDto } from "../../AddressDto";
import { HourDto } from "../../HourDto";
import { OfferTypeDto } from "../../OfferTypeDto";
import { PhotoDto } from "../../PhotoDto";
import { ShopDetailDto } from "../../ShopDetail";
import { ShopTypeDto } from "../../ShopTypeDto";

export interface ShopAddReqDto {
    title: string;
    address: AddressDto;
    hours: HourDto[];
    offerType: OfferTypeDto;
    detail: ShopDetailDto;
    types: ShopTypeDto[];
    photos: PhotoDto[];
}