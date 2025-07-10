import { ChapterSchema } from 'src/shared/models/shared-chapter.model'
import z from 'zod'

export const CreateChaperBodySchema = ChapterSchema.pick({
  title: true,
  description: true,
  isDraft: true,
  courseId: true
}).strict()

export const CreateChaperResSchema = ChapterSchema

export const UpdateChaperBodySchema = CreateChaperBodySchema

export const UpdateChaperResSchema = ChapterSchema

export const GetChapterParamsSchema = z
  .object({
    chapterId: z.coerce.number().int().positive()
  })
  .strict()

export type CreateChaperBodyType = z.infer<typeof CreateChaperBodySchema>
export type CreateChaperResType = z.infer<typeof CreateChaperResSchema>
export type UpdateChaperBodyType = z.infer<typeof UpdateChaperBodySchema>
export type UpdateChaperResType = z.infer<typeof UpdateChaperResSchema>
export type GetChapterParamsType = z.infer<typeof GetChapterParamsSchema>
