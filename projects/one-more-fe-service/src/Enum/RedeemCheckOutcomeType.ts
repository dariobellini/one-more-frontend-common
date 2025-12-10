export enum RedeemCheckOutcomeType {
  Success = 0,
  NoLogged = 1,
  IsOwner = 2,
  AlreadyRedeemed = 3,
  AlreadyUsedToday = 4,
  RefusedMoreTooMuchCouponThisWeek = 5,
  MaxLimitExceeded = 6,
  MaxLimitPerUserExceeded = 7
}