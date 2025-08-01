import { CourseEnrollmentStatus } from 'src/shared/constants/course-enrollment.constant'
import { OrderBy, SortBy } from 'src/shared/constants/other.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { CourseSchema } from 'src/shared/models/shrared-course.model'
import z from 'zod'

export const CourseEnrollmentSchema = z.object({
  id: z.number().int().positive(),
  courseId: z.number().int().positive(),
  userId: z.number().int().positive(),
  status: z
    .enum([CourseEnrollmentStatus.ACTIVE, CourseEnrollmentStatus.BLOCKED])
    .default(CourseEnrollmentStatus.ACTIVE),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateCourseEnrollmentBodySchema = CourseEnrollmentSchema.pick({
  courseId: true,
  status: true
})
  .strict()
  .extend({
    userIds: z.array(z.number())
  })

export const UpdateCourseEnrollmentBodySchema = CourseEnrollmentSchema.pick({
  courseId: true,
  status: true,
  userId: true
})

export const GetCourseEnrollmentParamsSchema = z
  .object({
    courseEnrollmentId: z.coerce.number().int().positive()
  })
  .strict()

export const GetCourseEnrollmentDetailResSchema = CourseEnrollmentSchema.extend({
  course: CourseSchema.pick({
    id: true,
    image: true,
    title: true,
    price: true,
    discount: true
  }).extend({
    createdBy: UserSchema.pick({
      id: true,
      fullName: true,
      email: true
    }).nullable()
  }),
  user: UserSchema.pick({
    id: true,
    fullName: true,
    email: true
  })
})

export const CreateCourseEnrollmentResSchema = z.object({
  courseEnrollments: z.array(GetCourseEnrollmentDetailResSchema)
})
export const UpdateCourseEnrollmentResSchema = GetCourseEnrollmentDetailResSchema

export const GetCourseEnrollmentListResSchema = z.object({
  courseEnrollments: z.array(GetCourseEnrollmentDetailResSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetCourseEnrollmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        const status = value.toUpperCase()
        if (status === CourseEnrollmentStatus.ACTIVE) {
          return CourseEnrollmentStatus.ACTIVE
        }
        if (status === CourseEnrollmentStatus.BLOCKED) {
          return CourseEnrollmentStatus.BLOCKED
        }
      }
      return undefined
    },
    z.enum([CourseEnrollmentStatus.ACTIVE, CourseEnrollmentStatus.BLOCKED]).optional()
  ),
  courseId: z.coerce.number().int().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  titleCourse: z.string().optional(),
  orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
  sortBy: z
    .enum([SortBy.CreatedAt, SortBy.FullName, SortBy.Email, SortBy.Price, SortBy.Sale])
    .default(SortBy.CreatedAt),
  getAll: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true'
      }
      return false
    }, z.boolean())
    .optional()
})

export type CourseEnrollmentType = z.infer<typeof CourseEnrollmentSchema>
export type CreateCourseEnrollmentBodyType = z.infer<typeof CreateCourseEnrollmentBodySchema>
export type UpdateCourseEnrollmentBodyType = z.infer<typeof UpdateCourseEnrollmentBodySchema>
export type GetCourseEnrollmentParamsType = z.infer<typeof GetCourseEnrollmentParamsSchema>
export type GetCourseEnrollmentDetailResType = z.infer<typeof GetCourseEnrollmentDetailResSchema>
export type CreateCourseEnrollmentResType = z.infer<typeof CreateCourseEnrollmentResSchema>
export type UpdateCourseEnrollmentResType = z.infer<typeof UpdateCourseEnrollmentResSchema>
export type GetCourseEnrollmentListResType = z.infer<typeof GetCourseEnrollmentListResSchema>
export type GetCourseEnrollmentQueryType = z.infer<typeof GetCourseEnrollmentQuerySchema>
