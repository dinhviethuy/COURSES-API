export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
} as const

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]
