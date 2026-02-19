import { AddUpdatePhotoDto } from "../../FastRecDtos/AddUpdatePhotoDto";
import { HourDto } from "../../HourDto";
import { PromoCategoryDto } from "../../PromoCategoryDto";
import { PromoLimitDto } from "../../PromoLimitDto";
import { PromoPeriodDto } from "../../PromoPeriodDto";
import { PromoTypeDto } from "../../PromoTypeDto";

export class PromoAddReqDto {
  shopId!: number;
  title!: string;
  description!: string;
  hours!: HourDto[];
  categories!: PromoCategoryDto[];
  types!: PromoTypeDto[];
  limit!: PromoLimitDto;
  period!: PromoPeriodDto;
  photos!: AddUpdatePhotoDto[];
}
