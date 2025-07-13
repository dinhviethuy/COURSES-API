import { Injectable, NotFoundException } from '@nestjs/common'
import { CouponType as CouponTypeConstant } from 'src/shared/constants/counpon.constant'
import { OrderBy } from 'src/shared/constants/orther.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CouponType,
  CreateCouponBodyType,
  CreateCouponResType,
  GetCouponDetailResType,
  GetCouponListResType,
  GetValidateCouponBodyType,
  GetValidateCouponResType,
  UpdateCouponBodyType,
  UpdateCouponResType
} from './coupon.model'

@Injectable()
export class CouponRepo {
  constructor(private readonly prisma: PrismaService) {}

  async validateCoupon({ code, courseId }: GetValidateCouponBodyType): Promise<GetValidateCouponResType> {
    const data = new Date()
    const [coupon, course] = await Promise.all([
      this.prisma.coupon.findFirst({
        where: {
          code,
          deletedAt: null,
          isActive: true,
          startAt: {
            lte: data
          },
          endAt: {
            gte: data
          }
        }
      }),
      this.prisma.course.findUnique({
        where: {
          id: courseId,
          deletedAt: null,
          isDraft: false
        }
      })
    ])
    if (!coupon) {
      throw new NotFoundException('Coupon không tồn tại')
    }
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại')
    }
    const coursePrice = course.price * ((100 - course.discount) / 100)
    let discountAmount = 0
    if (coupon.couponType === CouponTypeConstant.PERCENT) {
      discountAmount = (coursePrice * coupon.discount) / 100
    } else {
      discountAmount = Math.min(coupon.discount, coursePrice)
    }

    return {
      id: coupon.id,
      code: coupon.code,
      discountAmount
    }
  }

  async getCoupons(): Promise<GetCouponListResType> {
    const coupons = await this.prisma.coupon.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: OrderBy.Desc
      }
    })
    return {
      coupons
    }
  }

  getCoupon(couponId: number): Promise<GetCouponDetailResType | null> {
    return this.prisma.coupon.findUnique({
      where: {
        id: couponId,
        deletedAt: null
      }
    })
  }

  createCoupon({
    data,
    createdById
  }: {
    data: CreateCouponBodyType
    createdById: number
  }): Promise<CreateCouponResType> {
    return this.prisma.coupon.create({
      data: {
        ...data,
        createdById
      }
    })
  }

  updateCoupon({
    data,
    updatedById,
    couponId
  }: {
    data: UpdateCouponBodyType
    updatedById: number
    couponId: number
  }): Promise<UpdateCouponResType> {
    return this.prisma.coupon.update({
      where: {
        id: couponId
      },
      data: {
        ...data,
        updatedById
      }
    })
  }

  deleteCoupon(
    { couponId, deletedById }: { couponId: number; deletedById: number },
    isHard?: boolean
  ): Promise<CouponType> {
    return isHard
      ? this.prisma.coupon.delete({
          where: {
            id: couponId
          }
        })
      : this.prisma.coupon.update({
          where: {
            id: couponId,
            deletedAt: null
          },
          data: {
            deletedById,
            deletedAt: new Date()
          }
        })
  }
}
