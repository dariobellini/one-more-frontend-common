import { AddressDto } from "../../AddressDto";
import { AddUpdatePhotoDto } from "../../FastRecDtos/AddUpdatePhotoDto";
import { HourDto } from "../../HourDto";
import { OfferTypeDto } from "../../OfferTypeDto";
import { ShopDetailDto } from "../../ShopDetail";
import { ShopTypeDto } from "../../ShopTypeDto";
import { StaffDto } from "../../StaffDto";

export interface ShopAddReqDto {
    title: string;
    address: AddressDto;
    hours: HourDto[];
    offerType: OfferTypeDto;
    detail: ShopDetailDto;
    types: ShopTypeDto[];
    photos: AddUpdatePhotoDto[];
    staff: StaffDto[];
}   