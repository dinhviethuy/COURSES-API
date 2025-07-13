import { createZodDto } from 'nestjs-zod'
import {
  CreateCartBodySchema,
  CreateCartResSchema,
  GetCartParamsSchema,
  GetCartQuerySchema,
  GetListCartResSchema
} from 'src/routes/cart/cart.model'

export class CreateCartBodyDTO extends createZodDto(CreateCartBodySchema) {}

export class CreateCartResDTO extends createZodDto(CreateCartResSchema) {}

export class GetCartParamsDTO extends createZodDto(GetCartParamsSchema) {}

export class GetListCartQueryDTO extends createZodDto(GetCartQuerySchema) {}

export class GetListCartResDTO extends createZodDto(GetListCartResSchema) {}
