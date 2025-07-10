import { createZodDto } from 'nestjs-zod'
import {
  CreateChaperBodySchema,
  CreateChaperResSchema,
  GetChapterParamsSchema,
  UpdateChaperBodySchema,
  UpdateChaperResSchema
} from './chapter.model'

export class CreateChaperBodyDTO extends createZodDto(CreateChaperBodySchema) {}

export class CreateChaperResDTO extends createZodDto(CreateChaperResSchema) {}

export class UpdateChaperBodyDTO extends createZodDto(UpdateChaperBodySchema) {}

export class UpdateChaperResDTO extends createZodDto(UpdateChaperResSchema) {}

export class GetChapterParamsDTO extends createZodDto(GetChapterParamsSchema) {}
