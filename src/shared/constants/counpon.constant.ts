export const CouponType = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED'
} as const

export type CouponType = (typeof CouponType)[keyof typeof CouponType]
