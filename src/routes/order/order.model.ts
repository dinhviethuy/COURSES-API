import { CouponType } from 'src/shared/constants/counpon.constant'
import { CourseType } from 'src/shared/constants/course.constant'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const OrderSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  couponId: z.number().int().positive().nullable(),
  courseId: z.number().int().positive(),
  status: z.enum([OrderStatus.CANCELLED, OrderStatus.PAID, OrderStatus.PENDING]).default(OrderStatus.PENDING),
  createdById: z.number().int().positive().nullable(),
  updatedById: z.number().int().positive().nullable(),
  deletedById: z.number().int().positive().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
})

export const OrderItemSnapshotSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  couponId: z.number().int().positive().nullable(),
  courseId: z.number().int().positive(),
  courseImage: z.string().nullable(),
  courseTitle: z.string().nullable(),
  coursePrice: z.number().int().min(0).nullable(),
  courseDiscount: z.number().int().min(0).nullable(),
  couponCode: z.string().nullable(),
  courseType: z.enum([CourseType.COMBO, CourseType.SINGLE]).nullable(),
  couponDiscount: z.number().int().min(0).nullable(),
  couponType: z.enum([CouponType.PERCENT, CouponType.FIXED]).nullable(),
  couponStartAt: z.coerce.date().nullable(),
  couponEndAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date()
})

export const GetOrderListResSchema = z.object({
  orders: z.array(
    OrderSchema.extend({
      snapshots: z.array(OrderItemSnapshotSchema)
    }).omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    })
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetOrderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        const lowered = value.trim().toLowerCase()
        if (lowered === OrderStatus.CANCELLED.toLowerCase()) return OrderStatus.CANCELLED
        if (lowered === OrderStatus.PAID.toLowerCase()) return OrderStatus.PAID
        if (lowered === OrderStatus.PENDING.toLowerCase()) return OrderStatus.PENDING
        return undefined
      }
      return undefined
    },
    z.enum([OrderStatus.CANCELLED, OrderStatus.PAID, OrderStatus.PENDING]).optional()
  ),
  getAll: z
    .preprocess((value: any) => {
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true'
      }
      return false
    }, z.boolean())
    .optional()
})

export const GetOrderDetailResSchema = OrderSchema.pick({
  id: true,
  userId: true,
  couponId: true,
  status: true,
  createdAt: true,
  updatedAt: true
}).extend({
  snapshots: z.array(OrderItemSnapshotSchema),
  user: UserSchema.pick({
    id: true,
    fullName: true,
    email: true
  })
})

export const CreateOrderBodySchema = z
  .object({
    couponId: z.number().int().positive().optional().nullable(),
    cartId: z.number().int().positive()
  })
  .strict()

export const CancelOrderBodySchema = z
  .object({
    orderId: z.number().int().positive()
  })
  .strict()

export const CreateOrderResSchema = OrderSchema

export const GetOrderParamSchema = z.object({
  orderId: z.coerce.number().int().positive()
})

export type OrderType = z.infer<typeof OrderSchema>
export type OrderItemSnapshotType = z.infer<typeof OrderItemSnapshotSchema>
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type CancelOrderBodyType = z.infer<typeof CancelOrderBodySchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>
export type GetOrderListQueryType = z.infer<typeof GetOrderListQuerySchema>
export type GetOrderListResType = z.infer<typeof GetOrderListResSchema>
export type GetOrderDetailResType = z.infer<typeof GetOrderDetailResSchema>
export type GetOrderParamType = z.infer<typeof GetOrderParamSchema>
