import { ShopVisibilityStatus } from "../../../Enum/ShopVisibilityStatus";
import { AddressDto } from "../../AddressDto";
import { PhotoDto } from "../../PhotoDto";
import { ShopDetailDto } from "../../ShopDetail";
import { ShopStaffDto } from "../../StaffDto";


export interface ShopListDto {
    id: number;
    title: string;
    detail: ShopDetailDto;
    address: AddressDto;
    photo: PhotoDto;
    distance?: number;
    isPromoPresente: boolean;
    staff: ShopStaffDto;
    status?: ShopVisibilityStatus;

}