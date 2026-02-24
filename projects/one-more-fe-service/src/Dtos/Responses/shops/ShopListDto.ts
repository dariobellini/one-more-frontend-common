import { ShopVisibilityStatus } from "../../../Enum/ShopVisibilityStatus";
import { AddressDto } from "../../AddressDto";
import { PhotoDto } from "../../PhotoDto";
import { ShopDetailDto } from "../../ShopDetail";


export interface ShopListDto {
    id: number;
    title: string;
    detail: ShopDetailDto;
    address: AddressDto;
    photo: PhotoDto;
    isPromoPresente: boolean;
    status?: ShopVisibilityStatus;
}