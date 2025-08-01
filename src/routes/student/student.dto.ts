import { createZodDto } from 'nestjs-zod'
import {
  CreateCourseEnrollmentBodySchema,
  CreateCourseEnrollmentResSchema,
  GetCourseEnrollmentDetailResSchema,
  GetCourseEnrollmentListResSchema,
  GetCourseEnrollmentParamsSchema,
  GetCourseEnrollmentQuerySchema,
  UpdateCourseEnrollmentBodySchema,
  UpdateCourseEnrollmentResSchema
} from './student.model'

export class CreateCourseEnrollmentBodyDTO extends createZodDto(CreateCourseEnrollmentBodySchema) {}

export class UpdateCourseEnrollmentBodyDTO extends createZodDto(UpdateCourseEnrollmentBodySchema) {}

export class GetCourseEnrollmentParamsDTO extends createZodDto(GetCourseEnrollmentParamsSchema) {}

export class GetCourseEnrollmentDetailResDTO extends createZodDto(GetCourseEnrollmentDetailResSchema) {}

export class CreateCourseEnrollmentResDTO extends createZodDto(CreateCourseEnrollmentResSchema) {}

export class UpdateCourseEnrollmentResDTO extends createZodDto(UpdateCourseEnrollmentResSchema) {}

export class GetCourseEnrollmentListResDTO extends createZodDto(GetCourseEnrollmentListResSchema) {}

export class GetCourseEnrollmentQueryDTO extends createZodDto(GetCourseEnrollmentQuerySchema) {}
