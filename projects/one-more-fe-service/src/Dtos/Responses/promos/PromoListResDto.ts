import { PromoListDto } from "../../PromoListDto";
import { CommonResDto } from "../CommonResDto";

export interface PromoListResDto extends CommonResDto{
    promos: PromoListDto[];

}