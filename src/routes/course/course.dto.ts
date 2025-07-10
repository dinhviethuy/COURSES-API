import { createZodDto } from 'nestjs-zod'
import {
  CreateCourseBodySchema,
  CreateCourseResSchema,
  GetCourseDetailResSchema,
  GetCourseParamsSchema,
  GetCoursesQuerySchema,
  GetManageCoursesQuerySchema,
  ListCoursesResSchema,
  UpdateCourseBodySchema,
  UpdateCourseResSchema
} from './course.model'

export class GetCourseDetailResDTO extends createZodDto(GetCourseDetailResSchema) {}

export class CreateCourseBodyDTO extends createZodDto(CreateCourseBodySchema) {}

export class CreateCourseResDTO extends createZodDto(CreateCourseResSchema) {}

export class UpdateCourseBodyDTO extends createZodDto(UpdateCourseBodySchema) {}

export class UpdateCourseResDTO extends createZodDto(UpdateCourseResSchema) {}

export class GetCourseParamsDTO extends createZodDto(GetCourseParamsSchema) {}

export class ListCoursesResDTO extends createZodDto(ListCoursesResSchema) {}

export class GetCoursesQueryDTO extends createZodDto(GetCoursesQuerySchema) {}

export class GetManageCoursesQueryDTO extends createZodDto(GetManageCoursesQuerySchema) {}
