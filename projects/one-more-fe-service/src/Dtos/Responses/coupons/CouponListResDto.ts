import { CouponListDto } from "../../coupons/CouponListDto";
import { CommonResDto } from "../CommonResDto";

export interface CouponListResDto extends CommonResDto{
    coupons: CouponListDto[];
}