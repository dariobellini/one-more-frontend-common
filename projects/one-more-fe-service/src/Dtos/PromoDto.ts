import { HourDto } from "./HourDto";
import { PhotoDto } from "./PhotoDto";
import { PromoCategoryDto } from "./PromoCategoryDto";
import { PromoLimitDto } from "./PromoLimitDto";
import { PromoPeriodDto } from "./PromoPeriodDto";
import { PromoTypeDto } from "./PromoTypeDto";

export class PromoDto {
    id!: number;
    shopId!: number;
    title!: string;
    description!: string;
    startDate!: Date | null;
    endDate!: Date | null;
    hours!: HourDto[];
    categories!: PromoCategoryDto[];
    types!: PromoTypeDto[];
    limit!: PromoLimitDto;
    periods!: PromoPeriodDto[];
    photos!: PhotoDto[];
}