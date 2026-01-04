import { HourDto } from "./HourDto";
import { PhotoDto } from "./PhotoDto";
import { PromoCategoryDto } from "./PromoCategoryDto";
import { PromoLimitDto } from "./PromoLimitDto";
import { PromoPeriodDto } from "./PromoPeriodDto";
import { PromoTypeDto } from "./PromoTypeDto";
import { ShopListDto } from "./Responses/shops/ShopListDto";

export class PromoListDto {
    id!: number;
    isActive!: boolean;
    shopId!: number;
    title!: string;
    description!: string;
    startDate!: Date;
    endDate!: Date;
    hours!: HourDto[];
    categories!: PromoCategoryDto[];
    types!: PromoTypeDto[];
    limit!: PromoLimitDto;
    periods!: PromoPeriodDto[];
    photo!: PhotoDto;
    shop!: ShopListDto;
}