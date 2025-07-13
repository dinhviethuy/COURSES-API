import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateCouponBodyType, GetValidateCouponBodyType, UpdateCouponBodyType } from 'src/routes/coupon/coupon.model'
import { CouponRepo } from 'src/routes/coupon/coupon.repo'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class CouponService {
  constructor(private readonly couponRepo: CouponRepo) {}

  validateCoupon(body: GetValidateCouponBodyType) {
    return this.couponRepo.validateCoupon(body)
  }

  getCoupons() {
    return this.couponRepo.getCoupons()
  }

  async getCoupon(couponId: number) {
    try {
      const coupon = await this.couponRepo.getCoupon(couponId)
      if (!coupon) {
        throw new NotFoundException('Coupon không tồn tại')
      }
      return coupon
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi lấy coupon')
    }
  }

  async createCoupon({ body, createdById }: { body: CreateCouponBodyType; createdById: number }) {
    try {
      const coupon = await this.couponRepo.createCoupon({ data: body, createdById })
      return coupon
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Mã coupon đã tồn tại')
      }
      throw new BadRequestException('Lỗi khi tạo coupon')
    }
  }

  async updateCoupon({
    couponId,
    body,
    updatedById
  }: {
    couponId: number
    body: UpdateCouponBodyType
    updatedById: number
  }) {
    try {
      const coupon = await this.couponRepo.updateCoupon({ couponId, data: body, updatedById })
      return coupon
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Mã coupon đã tồn tại')
      }
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Coupon không tồn tại')
      }
      throw new BadRequestException('Lỗi khi cập nhật coupon')
    }
  }

  async deleteCoupon({ couponId, deletedById }: { couponId: number; deletedById: number }) {
    try {
      await this.couponRepo.deleteCoupon({ couponId, deletedById })
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Coupon không tồn tại')
      }
      throw new BadRequestException('Lỗi khi xóa coupon')
    }
  }
}
