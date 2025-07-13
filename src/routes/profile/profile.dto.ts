import { createZodDto } from 'nestjs-zod'
import {
  ChangePasswordBodySchema,
  GetProfileResSchema,
  UpdateProfileBodySchema
} from 'src/routes/profile/profile.model'
import { UpdateProfileResSchema } from 'src/shared/models/shared-user.model'

export class GetProfileResDTO extends createZodDto(GetProfileResSchema) {}

export class UpdateProfileBodyDTO extends createZodDto(UpdateProfileBodySchema) {}

export class UpdateProfileResDTO extends createZodDto(UpdateProfileResSchema) {}

export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
