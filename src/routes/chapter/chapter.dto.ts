import { createZodDto } from 'nestjs-zod'
import {
  CreateChapterBodySchema,
  CreateChapterResSchema,
  GetChapterParamsSchema,
  UpdateChapterBodySchema,
  UpdateChapterResSchema
} from 'src/routes/chapter/chapter.model'

export class CreateChapterBodyDTO extends createZodDto(CreateChapterBodySchema) {}

export class CreateChapterResDTO extends createZodDto(CreateChapterResSchema) {}

export class UpdateChapterBodyDTO extends createZodDto(UpdateChapterBodySchema) {}

export class UpdateChapterResDTO extends createZodDto(UpdateChapterResSchema) {}

export class GetChapterParamsDTO extends createZodDto(GetChapterParamsSchema) {}
