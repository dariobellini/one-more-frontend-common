import { PromoListDto } from "../../PromoListDto";
import { CommonResDto } from "../CommonResDto";
import { ShopListDto } from "../shops/ShopListDto";

export interface SearchResDto extends CommonResDto {
    promos: PromoListDto[];
    shops: ShopListDto[];
}