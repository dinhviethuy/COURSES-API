import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCouponBodyDTO,
  CreateCouponResDTO,
  GetCouponDetailResDTO,
  GetCouponListResDTO,
  GetCouponParamsDTO,
  GetCouponsQueryDTO,
  GetValidateCouponBodyDTO,
  GetValidateCouponResDTO,
  UpdateCouponBodyDTO,
  UpdateCouponResDTO
} from 'src/routes/coupon/coupon.dto'
import { CouponService } from 'src/routes/coupon/coupon.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'

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
  getCoupons(@Query() query: GetCouponsQueryDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.couponService.getCoupons({
      roleId: user.roleId,
      userId: user.userId,
      query
    })
  }

  @Get(':couponId')
  @MessageRes('Lấy chi tiết coupon thành công')
  @ZodSerializerDto(GetCouponDetailResDTO)
  getCoupon(@Param() params: GetCouponParamsDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.couponService.getCoupon({
      couponId: params.couponId,
      roleId: user.roleId,
      userId: user.userId
    })
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
    @ActiveUser() user: SessionTokenPayload
  ) {
    return this.couponService.updateCoupon({
      couponId: params.couponId,
      body,
      updatedById: user.userId,
      roleId: user.roleId
    })
  }

  @Delete(':couponId')
  @MessageRes('Xóa coupon thành công')
  deleteCoupon(@Param() params: GetCouponParamsDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.couponService.deleteCoupon({
      couponId: params.couponId,
      deletedById: user.userId,
      roleId: user.roleId
    })
  }
}
