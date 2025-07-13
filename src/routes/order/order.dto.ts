import { createZodDto } from 'nestjs-zod'
import {
  CancelOrderBodySchema,
  CreateOrderBodySchema,
  CreateOrderResSchema,
  GetOrderDetailResSchema,
  GetOrderListQuerySchema,
  GetOrderListResSchema,
  GetOrderParamSchema
} from 'src/routes/order/order.model'

export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

export class CreateOrderResDTO extends createZodDto(CreateOrderResSchema) {}

export class GetOrderListQueryDTO extends createZodDto(GetOrderListQuerySchema) {}

export class GetOrderListResDTO extends createZodDto(GetOrderListResSchema) {}

export class GetOrderDetailResDTO extends createZodDto(GetOrderDetailResSchema) {}

export class CancelOrderBodyDTO extends createZodDto(CancelOrderBodySchema) {}

export class GetOrderParamDTO extends createZodDto(GetOrderParamSchema) {}
