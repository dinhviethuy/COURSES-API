import z from 'zod'

export const LessonSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().default(''),
  order: z.number().min(0).default(0),
  isDraft: z.boolean().default(true),
  chapterId: z.number().int().positive(),
  duration: z.number().min(0).default(0),
  videoUrl: z.string().url().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable()
})

export const CreateLessonBodySchema = LessonSchema.pick({
  title: true,
  description: true,
  isDraft: true,
  chapterId: true,
  duration: true,
  videoUrl: true
})
  .strict()
  .superRefine((data, ctx) => {
    if (!data.videoUrl) {
      if (!data.description) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Không có video thì phải có mô tả',
          path: ['videoUrl', 'description']
        })
      }
    }
  })

export const CreateLessonResSchema = LessonSchema

export const UpdateLessonBodySchema = CreateLessonBodySchema

export const UpdateLessonResSchema = CreateLessonResSchema

export const GetLessonParamsSchema = z.object({
  lessonId: z.coerce.number().int().positive()
})

export const GetLessonDetailResSchema = LessonSchema

export type LessonType = z.infer<typeof LessonSchema>
export type CreateLessonBodyType = z.infer<typeof CreateLessonBodySchema>
export type CreateLessonResType = z.infer<typeof CreateLessonResSchema>
export type UpdateLessonBodyType = z.infer<typeof UpdateLessonBodySchema>
export type UpdateLessonResType = z.infer<typeof UpdateLessonResSchema>
export type GetLessonParamsType = z.infer<typeof GetLessonParamsSchema>
export type GetLessonDetailResType = z.infer<typeof GetLessonDetailResSchema>
