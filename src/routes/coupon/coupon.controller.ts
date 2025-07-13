import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import {
  CreateCouponBodyDTO,
  CreateCouponResDTO,
  GetCouponDetailResDTO,
  GetCouponListResDTO,
  GetCouponParamsDTO,
  GetValidateCouponBodyDTO,
  GetValidateCouponResDTO,
  UpdateCouponBodyDTO,
  UpdateCouponResDTO
} from './coupon.dto'
import { CouponService } from './coupon.service'

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('validate')
  @MessageRes('Validate coupon thành công')
  @ZodSerializerDto(GetValidateCouponResDTO)
  validateCoupon(@Body() body: GetValidateCouponBodyDTO) {
    return this.couponService.validateCoupon(body)
  }

  @Get()
  @MessageRes('Lấy danh sách coupon thành công')
  @ZodSerializerDto(GetCouponListResDTO)
  getCoupons() {
    return this.couponService.getCoupons()
  }

  @Get(':couponId')
  @MessageRes('Lấy chi tiết coupon thành công')
  @ZodSerializerDto(GetCouponDetailResDTO)
  getCoupon(@Param() params: GetCouponParamsDTO) {
    return this.couponService.getCoupon(params.couponId)
  }

  @Post()
  @MessageRes('Tạo coupon thành công')
  @ZodSerializerDto(CreateCouponResDTO)
  createCoupon(@Body() body: CreateCouponBodyDTO, @ActiveUser('userId') userId: number) {
    return this.couponService.createCoupon({ body, createdById: userId })
  }

  @Put(':couponId')
  @MessageRes('Cập nhật coupon thành công')
  @ZodSerializerDto(UpdateCouponResDTO)
  updateCoupon(
    @Param() params: GetCouponParamsDTO,
    @Body() body: UpdateCouponBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.couponService.updateCoupon({ couponId: params.couponId, body, updatedById: userId })
  }

  @Delete(':couponId')
  @MessageRes('Xóa coupon thành công')
  deleteCoupon(@Param() params: GetCouponParamsDTO, @ActiveUser('userId') userId: number) {
    return this.couponService.deleteCoupon({ couponId: params.couponId, deletedById: userId })
  }
}
