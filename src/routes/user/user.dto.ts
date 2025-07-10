import { createZodDto } from 'nestjs-zod'
import { UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  GetUsersQuerySchema,
  GetUsersResSchema,
  UpdateUserBodySchema
} from './user.model'

export class GetUsersResDTO extends createZodDto(GetUsersResSchema) {}
export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}
export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class CreateUserResDTO extends UpdateProfileResDTO {}
