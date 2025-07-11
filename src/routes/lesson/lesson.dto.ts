import { createZodDto } from 'nestjs-zod'
import {
  CreateLessonBodySchema,
  CreateLessonResSchema,
  GetLessonDetailResSchema,
  GetLessonParamsSchema,
  UpdateLessonBodySchema,
  UpdateLessonResSchema
} from './lesson.model'

export class CreateLessonBodyDTO extends createZodDto(CreateLessonBodySchema) {}

export class CreateLessonResDTO extends createZodDto(CreateLessonResSchema) {}

export class UpdateLessonBodyDTO extends createZodDto(UpdateLessonBodySchema) {}

export class UpdateLessonResDTO extends createZodDto(UpdateLessonResSchema) {}

export class GetLessonParamsDTO extends createZodDto(GetLessonParamsSchema) {}

export class GetLessonDetailResDTO extends createZodDto(GetLessonDetailResSchema) {}
