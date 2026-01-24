import { PromoListDto } from "../../PromoListDto";
import { CommonResDto } from "../CommonResDto";
import { ShopListDto } from "../shops/ShopListDto";

export interface MapResDto extends CommonResDto{
    shops:ShopListDto[];
    promos: PromoListDto[];

}