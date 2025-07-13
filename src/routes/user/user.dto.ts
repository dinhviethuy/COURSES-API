import { createZodDto } from 'nestjs-zod'
import {
  GetUsersResSchema,
  GetUsersQuerySchema,
  CreateUserBodySchema,
  UpdateUserBodySchema,
  GetUserParamsSchema
} from 'src/routes/user/user.model'
import { UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'

export class GetUsersResDTO extends createZodDto(GetUsersResSchema) {}
export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}
export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class CreateUserResDTO extends UpdateProfileResDTO {}
