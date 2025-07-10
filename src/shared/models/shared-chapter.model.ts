import z from 'zod'

export const ChapterSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().default(''),
  order: z.number().min(0).default(0),
  isDraft: z.boolean().default(true),
  courseId: z.number().int().positive(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable()
})

export type ChapterType = z.infer<typeof ChapterSchema>
