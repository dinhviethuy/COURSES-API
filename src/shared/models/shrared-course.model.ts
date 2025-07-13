import { CourseType } from 'src/shared/constants/course.constant'
import z from 'zod'

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
  benefits: z.array(z.string()).default([]),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable()
})

export type CourseType = z.infer<typeof CourseSchema>
