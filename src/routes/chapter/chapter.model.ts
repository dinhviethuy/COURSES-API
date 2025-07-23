import { ChapterSchema } from 'src/shared/models/shared-chapter.model'
import z from 'zod'

export const CreateChapterBodySchema = ChapterSchema.pick({
  title: true,
  description: true,
  isDraft: true,
  courseId: true
}).strict()

export const CreateChapterResSchema = ChapterSchema

export const UpdateChapterBodySchema = CreateChapterBodySchema

export const UpdateChapterResSchema = ChapterSchema

export const GetChapterParamsSchema = z
  .object({
    chapterId: z.coerce.number().int().positive()
  })
  .strict()

export type CreateChapterBodyType = z.infer<typeof CreateChapterBodySchema>
export type CreateChapterResType = z.infer<typeof CreateChapterResSchema>
export type UpdateChapterBodyType = z.infer<typeof UpdateChapterBodySchema>
export type UpdateChapterResType = z.infer<typeof UpdateChapterResSchema>
export type GetChapterParamsType = z.infer<typeof GetChapterParamsSchema>
