import { RedeemCheckOutcomeType } from "../../../Enum/RedeemCheckOutcomeType";
import { CommonResDto } from "../CommonResDto";

export interface CanRedeemResDto extends CommonResDto{
    checkOutcomes: RedeemCheckOutcomeType[];
}