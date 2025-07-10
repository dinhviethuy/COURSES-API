import { OrderBy, SortBy } from 'src/shared/constants/orther.constant'
import { z } from 'zod'

export const CourseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().min(0),
  isDraft: z.boolean().default(true),
  discount: z.number().min(0).default(0),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable()
})

export const ChapterSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().positive(),
  isDraft: z.boolean().default(true),
  courseId: z.number().int().positive(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable()
})

export const LessonSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().positive(),
  isDraft: z.boolean().default(true),
  chapterId: z.number().int().positive(),
  duration: z.number().int().positive(),
  videoUrl: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable()
})

export const ListCoursesResSchema = z.object({
  courses: z.array(
    CourseSchema.pick({
      id: true,
      title: true,
      description: true,
      slug: true,
      price: true,
      isDraft: true
    })
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetCoursesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
    sortBy: z.enum([SortBy.CreatedAt, SortBy.Price, SortBy.Sale]).default(SortBy.CreatedAt)
  })
  .strict()

export const GetManageCoursesQuerySchema = GetCoursesQuerySchema.extend({
  isDraft: z.preprocess((value) => {
    if (typeof value === 'string') {
      const lowered = value.trim().toLowerCase()
      if (lowered === 'true') return true
      if (lowered === 'false') return false
      return undefined
    }
    if (typeof value === 'boolean') return value
    return undefined
  }, z.boolean().optional()),
  createdById: z.coerce.number().int().positive().optional()
})

export const GetCourseDetailResSchema = CourseSchema.extend({
  chapters: z.array(
    ChapterSchema.pick({
      id: true,
      title: true,
      description: true,
      order: true,
      isDraft: true
    }).extend({
      lessons: z.array(
        LessonSchema.pick({
          id: true,
          title: true,
          description: true,
          order: true,
          isDraft: true,
          duration: true,
          videoUrl: true
        })
      )
    })
  )
})

export const CreateCourseBodySchema = CourseSchema.pick({
  title: true,
  description: true,
  slug: true,
  price: true,
  isDraft: true,
  discount: true
}).strict()

export const CreateCourseResSchema = CourseSchema

export const UpdateCourseBodySchema = CreateCourseBodySchema

export const UpdateCourseResSchema = CreateCourseResSchema

export const GetCourseParamsSchema = z.object({
  courseId: z.coerce.number().int().positive()
})

export type CourseType = z.infer<typeof CourseSchema>
export type ChapterType = z.infer<typeof ChapterSchema>
export type LessonType = z.infer<typeof LessonSchema>
export type GetCourseDetailResType = z.infer<typeof GetCourseDetailResSchema>
export type CreateCourseBodyType = z.infer<typeof CreateCourseBodySchema>
export type CreateCourseResType = z.infer<typeof CreateCourseResSchema>
export type UpdateCourseBodyType = z.infer<typeof UpdateCourseBodySchema>
export type UpdateCourseResType = z.infer<typeof UpdateCourseResSchema>
export type GetCourseParamsType = z.infer<typeof GetCourseParamsSchema>
export type ListCoursesResType = z.infer<typeof ListCoursesResSchema>
export type GetCoursesQueryType = z.infer<typeof GetCoursesQuerySchema>
export type GetManageCoursesQueryType = z.infer<typeof GetManageCoursesQuerySchema>
