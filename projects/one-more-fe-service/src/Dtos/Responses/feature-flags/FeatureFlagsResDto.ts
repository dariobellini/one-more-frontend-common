import { CommonResDto } from "../CommonResDto";
import { FreatureFlagDto } from "../../feature-flags/FeatureFlagDto";

export interface FeatureFlagsResDto extends CommonResDto{
     featureFlags: FreatureFlagDto[];
}