import { CouponType as CouponTypeConstant } from 'src/shared/constants/counpon.constant'
import { OrderBy, SortBy } from 'src/shared/constants/other.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const CouponSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().min(1),
  discount: z.number().min(0),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  isActive: z.boolean().default(true),
  couponType: z.enum([CouponTypeConstant.PERCENT, CouponTypeConstant.FIXED]),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable()
})

export const GetCouponsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    couponType: z.enum([CouponTypeConstant.PERCENT, CouponTypeConstant.FIXED]).optional(),
    isActive: z.preprocess((value) => {
      if (typeof value === 'string') {
        const lowered = value.trim().toLowerCase()
        if (lowered === 'true') return true
        if (lowered === 'false') return false
        return undefined
      }
      if (typeof value === 'boolean') return value
      return undefined
    }, z.boolean().optional()),
    orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
    sortBy: z.enum([SortBy.CreatedAt]).default(SortBy.CreatedAt)
  })
  .strict()

export const CreateCouponBodySchema = CouponSchema.pick({
  code: true,
  discount: true,
  startAt: true,
  endAt: true,
  couponType: true,
  isActive: true
})
  .strict()
  .superRefine((data, ctx) => {
    if (data.couponType === CouponTypeConstant.PERCENT) {
      if (data.discount > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Giảm giá không được lớn hơn 100%',
          path: ['discount']
        })
      }
    }
  })

export const CreateCouponResSchema = CouponSchema

export const UpdateCouponBodySchema = CouponSchema.pick({
  code: true,
  discount: true,
  startAt: true,
  endAt: true,
  couponType: true,
  isActive: true
})
  .strict()
  .superRefine((data, ctx) => {
    if (data.couponType === CouponTypeConstant.PERCENT) {
      if (data.discount > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Giảm giá không được lớn hơn 100%',
          path: ['discount']
        })
      }
    }
  })
export const UpdateCouponResSchema = CouponSchema

export const GetCouponParamsSchema = z.object({
  couponId: z.coerce.number().int().positive()
})

export const GetCouponDetailResSchema = CouponSchema.extend({
  createdBy: UserSchema.pick({
    id: true,
    fullName: true,
    email: true
  })
    .nullable()
    .optional()
})
export const GetCouponListResSchema = z.object({
  coupons: z.array(GetCouponDetailResSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetValidateCouponBodySchema = z
  .object({
    code: z.string().min(1),
    courseId: z.number().int().positive()
  })
  .strict()

export const GetValidateCouponResSchema = CouponSchema.pick({
  id: true,
  code: true
}).extend({
  discountAmount: z.number().min(0)
})

export type CouponType = z.infer<typeof CouponSchema>
export type CreateCouponBodyType = z.infer<typeof CreateCouponBodySchema>
export type CreateCouponResType = z.infer<typeof CreateCouponResSchema>
export type UpdateCouponBodyType = z.infer<typeof UpdateCouponBodySchema>
export type UpdateCouponResType = z.infer<typeof UpdateCouponResSchema>
export type GetCouponParamsType = z.infer<typeof GetCouponParamsSchema>
export type GetCouponDetailResType = z.infer<typeof GetCouponDetailResSchema>
export type GetCouponListResType = z.infer<typeof GetCouponListResSchema>
export type GetValidateCouponResType = z.infer<typeof GetValidateCouponResSchema>
export type GetValidateCouponBodyType = z.infer<typeof GetValidateCouponBodySchema>
export type GetCouponsQueryType = z.infer<typeof GetCouponsQuerySchema>
