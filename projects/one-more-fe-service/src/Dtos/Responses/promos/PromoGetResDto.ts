import { PromoDto } from "../../PromoDto";
import { CommonResDto } from "../CommonResDto";

export interface PromoGetResDto extends CommonResDto {
  promo: PromoDto;
}
