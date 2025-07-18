import { OrderBy, SortBy } from 'src/shared/constants/other.constant'
import { CourseSchema } from 'src/shared/models/shrared-course.model'
import z from 'zod'

export const CartSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  courseId: z.number().int().positive(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
})

export const CreateCartBodySchema = CartSchema.pick({
  courseId: true
}).strict()

export const CreateCartResSchema = CartSchema

export const GetCartParamsSchema = z.object({
  cartId: z.coerce.number().int().positive()
})

export const GetCartQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Asc),
  sortBy: z.enum([SortBy.CreatedAt, SortBy.Price]).default(SortBy.CreatedAt),
  getAll: z
    .preprocess((value: any) => {
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true'
      }
      return false
    }, z.boolean())
    .optional()
})

export const GetListCartResSchema = z.object({
  cartItems: z.array(
    CartSchema.extend({
      course: CourseSchema.pick({
        id: true,
        title: true,
        image: true,
        price: true,
        discount: true,
        slug: true,
        courseType: true
      })
    })
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export type CartType = z.infer<typeof CartSchema>
export type CreateCartBodyType = z.infer<typeof CreateCartBodySchema>
export type CreateCartResType = z.infer<typeof CreateCartResSchema>
export type GetCartParamsType = z.infer<typeof GetCartParamsSchema>
export type GetCartQueryType = z.infer<typeof GetCartQuerySchema>
export type GetListCartResType = z.infer<typeof GetListCartResSchema>
