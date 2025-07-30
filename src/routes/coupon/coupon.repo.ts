import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CouponType,
  CreateCouponBodyType,
  CreateCouponResType,
  GetCouponDetailResType,
  GetCouponListResType,
  GetCouponsQueryType,
  GetValidateCouponBodyType,
  GetValidateCouponResType,
  UpdateCouponBodyType,
  UpdateCouponResType
} from 'src/routes/coupon/coupon.model'
import { CouponType as CouponTypeConstant } from 'src/shared/constants/counpon.constant'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CouponRepo {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedRoleRepo: SharedRoleRepository
  ) {}

  private async checkForAdmin(roleId?: number) {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return roleId === adminRoleId
  }

  private async generateQuery({
    query,
    userId,
    roleId
  }: {
    query: GetCouponsQueryType
    userId: number
    roleId: number
  }) {
    const isAdmin = await this.checkForAdmin(roleId)
    const { page, limit, search, couponType, isActive, orderBy, sortBy } = query
    const where: Prisma.CouponWhereInput = {
      deletedAt: null,
      createdById: isAdmin ? undefined : userId,
      isActive
    }
    if (search) {
      where.code = {
        contains: search,
        mode: 'insensitive'
      }
    }
    if (couponType) {
      where.couponType = couponType
    }
    const caculatedOrderBy: Prisma.CouponOrderByWithRelationInput = {
      [sortBy]: orderBy
    }
    return {
      where,
      orderBy: caculatedOrderBy,
      skip: (page - 1) * limit,
      take: limit
    }
  }

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
        },
        include: {
          createdBy: {
            select: {
              id: true,
              roleId: true
            }
          }
        }
      }),
      this.prisma.course.findUnique({
        where: {
          id: courseId,
          deletedAt: null,
          isDraft: false
        },
        include: {
          createdBy: {
            select: {
              id: true,
              roleId: true
            }
          }
        }
      })
    ])
    if (!coupon) {
      throw new NotFoundException('Coupon không tồn tại')
    }
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại')
    }
    const isAdminCreate = await this.checkForAdmin(coupon.createdBy?.roleId)
    if (!isAdminCreate && coupon.createdById !== course.createdBy?.id) {
      throw new ForbiddenException('Coupon không hợp lệ')
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

  async getCoupons({
    userId,
    roleId,
    query
  }: {
    userId: number
    roleId: number
    query: GetCouponsQueryType
  }): Promise<GetCouponListResType> {
    const { where, orderBy, skip, take } = await this.generateQuery({ query, userId, roleId })
    const [coupons, totalItems] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy,
        skip,
        take
      }),
      this.prisma.coupon.count({
        where
      })
    ])
    return {
      coupons,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit)
    }
  }

  async getCoupon({
    couponId,
    userId,
    roleId
  }: {
    couponId: number
    userId: number
    roleId: number
  }): Promise<GetCouponDetailResType | null> {
    const isAdmin = await this.checkForAdmin(roleId)
    return this.prisma.coupon.findUnique({
      where: {
        id: couponId,
        deletedAt: null,
        createdById: isAdmin ? undefined : userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
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

  async updateCoupon({
    data,
    updatedById,
    couponId,
    roleId
  }: {
    data: UpdateCouponBodyType
    updatedById: number
    couponId: number
    roleId: number
  }): Promise<UpdateCouponResType> {
    const isAdmin = await this.checkForAdmin(roleId)
    return this.prisma.coupon.update({
      where: {
        id: couponId,
        deletedAt: null,
        createdById: isAdmin ? undefined : updatedById
      },
      data: {
        ...data,
        updatedById
      }
    })
  }

  async deleteCoupon(
    { couponId, deletedById, roleId }: { couponId: number; deletedById: number; roleId: number },
    isHard?: boolean
  ): Promise<CouponType> {
    const isAdmin = await this.checkForAdmin(roleId)
    return isHard
      ? this.prisma.coupon.delete({
          where: {
            id: couponId,
            createdById: isAdmin ? undefined : deletedById
          }
        })
      : this.prisma.coupon.update({
          where: {
            id: couponId,
            deletedAt: null,
            createdById: isAdmin ? undefined : deletedById
          },
          data: {
            deletedById,
            deletedAt: new Date()
          }
        })
  }
}
