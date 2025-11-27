import { HourDto } from "./HourDto";
import { PhotoDto } from "./PhotoDto";
import { PromoCategoryDto } from "./PromoCategoryDto";
import { PromoLimitDto } from "./PromoLimitDto";
import { PromoPeriodDto } from "./PromoPeriodDto";
import { PromoTypeDto } from "./PromoTypeDto";

export class PromoDto {

    shopId!: number;
    title!: string;
    description!: string;
    hours!: HourDto[];
    categories!: PromoCategoryDto[];
    types!: PromoTypeDto[];
    limit!: PromoLimitDto;
    periods!: PromoPeriodDto[];
    photos!: PhotoDto[];
}