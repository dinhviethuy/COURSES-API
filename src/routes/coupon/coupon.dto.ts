import { createZodDto } from 'nestjs-zod'
import {
  CreateCouponBodySchema,
  CreateCouponResSchema,
  GetCouponDetailResSchema,
  GetCouponListResSchema,
  GetCouponParamsSchema,
  GetValidateCouponBodySchema,
  GetValidateCouponResSchema,
  UpdateCouponBodySchema,
  UpdateCouponResSchema
} from './coupon.model'

export class CreateCouponBodyDTO extends createZodDto(CreateCouponBodySchema) {}

export class CreateCouponResDTO extends createZodDto(CreateCouponResSchema) {}

export class UpdateCouponBodyDTO extends createZodDto(UpdateCouponBodySchema) {}

export class UpdateCouponResDTO extends createZodDto(UpdateCouponResSchema) {}

export class GetCouponParamsDTO extends createZodDto(GetCouponParamsSchema) {}

export class GetCouponDetailResDTO extends createZodDto(GetCouponDetailResSchema) {}

export class GetCouponListResDTO extends createZodDto(GetCouponListResSchema) {}

export class GetValidateCouponResDTO extends createZodDto(GetValidateCouponResSchema) {}

export class GetValidateCouponBodyDTO extends createZodDto(GetValidateCouponBodySchema) {}
