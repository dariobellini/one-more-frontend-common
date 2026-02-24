import { ShopVisibilityStatus } from "../../../Enum/ShopVisibilityStatus";
import { AddressDto } from "../../AddressDto";
import { AddUpdatePhotoDto } from "../../FastRecDtos/AddUpdatePhotoDto";
import { HourDto } from "../../HourDto";
import { OfferTypeDto } from "../../OfferTypeDto";
import { ShopDetailDto } from "../../ShopDetail";
import { ShopTypeDto } from "../../ShopTypeDto";
import { CommonResDto } from "../CommonResDto";

export interface ShopDetailResDto extends CommonResDto {
    id: number;
    title: string;
    address: AddressDto;
    hours: HourDto[];
    offerType: OfferTypeDto;
    detail: ShopDetailDto;
    types: ShopTypeDto[];
    photos: AddUpdatePhotoDto[];
    status?: ShopVisibilityStatus;
    adminCheckOutcome?: string;
}