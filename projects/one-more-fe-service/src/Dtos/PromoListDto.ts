import { HourDto } from "./HourDto";
import { PhotoDto } from "./PhotoDto";
import { PromoCategoryDto } from "./PromoCategoryDto";
import { PromoLimitDto } from "./PromoLimitDto";
import { PromoPeriodDto } from "./PromoPeriodDto";
import { PromoTypeDto } from "./PromoTypeDto";

export class PromoListDto {
    id!: number;
    shopId!: number;
    title!: string;
    description!: string;
    hours!: HourDto[];
    categories!: PromoCategoryDto[];
    types!: PromoTypeDto[];
    limit!: PromoLimitDto;
    period!: PromoPeriodDto;
    photo!: PhotoDto;
}