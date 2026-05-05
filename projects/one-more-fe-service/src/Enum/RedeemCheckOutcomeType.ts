export enum RedeemCheckOutcomeType {
  Success = "01",
  NoLogged = "02",
  IsOwner = "03",
  AlreadyRedeemed = "04",
  AlreadyUsedToday = "05",
  RefusedMoreTooMuchCouponThisWeek = "06",
  MaxLimitExceeded = "07",
  MaxLimitPerUserExceeded = "08"
}