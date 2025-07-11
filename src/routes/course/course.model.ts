import { LessonSchema } from 'src/routes/lesson/lesson.model'
import { CourseType } from 'src/shared/constants/course.constant'
import { OrderBy, SortBy } from 'src/shared/constants/orther.constant'
import { ChapterSchema } from 'src/shared/models/shared-chapter.model'
import { z } from 'zod'

export const CourseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().default(''),
  slug: z.string(),
  price: z.number().min(0),
  isDraft: z.boolean().default(true),
  discount: z.number().min(0).max(100).default(0),
  image: z.string(),
  video: z.string().nullable().optional(),
  courseType: z.enum([CourseType.COMBO, CourseType.SINGLE]).default(CourseType.SINGLE),

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
      isDraft: true,
      courseType: true
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

export const GetCourseDetailResSchema = CourseSchema.pick({
  id: true,
  title: true,
  description: true,
  slug: true,
  price: true,
  isDraft: true,
  discount: true,
  image: true,
  video: true,
  courseType: true
}).extend({
  duration: z.number().min(0).default(0),
  chapters: z.array(
    ChapterSchema.pick({
      id: true,
      title: true,
      order: true
    }).extend({
      duration: z.number().min(0).default(0),
      lessons: z.array(
        LessonSchema.pick({
          id: true,
          title: true,
          order: true,
          duration: true
        })
      )
    })
  ),
  comboChildren: z.array(
    CourseSchema.pick({
      id: true,
      title: true,
      description: true,
      slug: true,
      courseType: true
    })
  )
})

export const GetCourseDetailResSchemaForAdmin = CourseSchema.pick({
  id: true,
  title: true,
  description: true,
  slug: true,
  price: true,
  isDraft: true,
  discount: true,
  image: true,
  video: true,
  courseType: true
}).extend({
  duration: z.number().min(0).default(0),
  chapters: z.array(
    ChapterSchema.pick({
      id: true,
      title: true,
      description: true,
      order: true,
      isDraft: true
    }).extend({
      duration: z.number().min(0).default(0),
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
  ),
  comboChildren: z.array(
    CourseSchema.pick({
      id: true,
      title: true,
      description: true,
      slug: true,
      courseType: true
    })
  )
})

export const CreateCourseBodySchema = CourseSchema.pick({
  title: true,
  description: true,
  slug: true,
  price: true,
  isDraft: true,
  discount: true,
  image: true,
  video: true,
  courseType: true
})
  .strict()
  .extend({
    courseIds: z.array(z.number().int().positive()).optional()
  })
  .superRefine((data, ctx) => {
    if (data.courseType === CourseType.COMBO && !data.courseIds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Course type is COMBO, courseIds is required',
        path: ['courseIds']
      })
    }
    if (data.courseType === CourseType.SINGLE && data.courseIds !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Course type is SINGLE, courseIds is not allowed',
        path: ['courseIds']
      })
    }
  })

export const CreateCourseResSchema = CourseSchema

export const UpdateCourseBodySchema = CreateCourseBodySchema

export const UpdateCourseResSchema = CreateCourseResSchema

export const GetCourseParamsSchema = z.object({
  courseId: z.coerce.number().int().positive()
})

export const ReorderChaptersAndLessonsBodySchema = z
  .object({
    chapters: z.array(
      ChapterSchema.pick({
        id: true,
        order: true
      }).extend({
        lessons: z.array(LessonSchema.pick({ id: true, order: true }))
      })
    )
  })
  .strict()
  .superRefine((data, ctx) => {
    // 1 chương chỉ có 1 order
    const chapterOrderSet = new Set<number>()
    for (const chapter of data.chapters) {
      if (chapterOrderSet.has(chapter.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Một chương chỉ có 1 order',
          path: ['chapters', 'order']
        })
      }
      chapterOrderSet.add(chapter.id)
    }
    // 1 bài học chỉ có 1 order
    const lessonOrderSet = new Set<number>()
    for (const chapter of data.chapters) {
      for (const lesson of chapter.lessons) {
        if (lessonOrderSet.has(lesson.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Một bài học chỉ có 1 order',
            path: ['chapters', 'lessons', 'order']
          })
        }
        lessonOrderSet.add(lesson.id)
      }
    }
  })

export type CourseType = z.infer<typeof CourseSchema>
export type GetCourseDetailResType = z.infer<typeof GetCourseDetailResSchema>
export type CreateCourseBodyType = z.infer<typeof CreateCourseBodySchema>
export type CreateCourseResType = z.infer<typeof CreateCourseResSchema>
export type UpdateCourseBodyType = z.infer<typeof UpdateCourseBodySchema>
export type UpdateCourseResType = z.infer<typeof UpdateCourseResSchema>
export type GetCourseParamsType = z.infer<typeof GetCourseParamsSchema>
export type ListCoursesResType = z.infer<typeof ListCoursesResSchema>
export type GetCoursesQueryType = z.infer<typeof GetCoursesQuerySchema>
export type GetManageCoursesQueryType = z.infer<typeof GetManageCoursesQuerySchema>
export type ReorderChaptersAndLessonsBodyType = z.infer<typeof ReorderChaptersAndLessonsBodySchema>
export type GetCourseDetailResTypeForAdmin = z.infer<typeof GetCourseDetailResSchemaForAdmin>
