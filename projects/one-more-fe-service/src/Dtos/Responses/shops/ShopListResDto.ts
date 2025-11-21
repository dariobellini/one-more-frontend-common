import { PromoListDto } from "../../PromoListDto";
import { CommonResDto } from "../CommonResDto";
import { ShopListDto } from "./ShopListDto";

export interface ShopListResDto extends CommonResDto{
    shops: ShopListDto[];

}