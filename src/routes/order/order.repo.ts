import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CreateOrderBodyType,
  CreateOrderResType,
  GetOrderDetailResType,
  GetOrderListQueryType,
  GetOrderListResType,
  OrderType
} from 'src/routes/order/order.model'
import { CourseEnrollmentStatus } from 'src/shared/constants/course-enrollment.constant'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { OrderBy } from 'src/shared/constants/other.constant'
import { getTotalPrice, isNotFoundPrismaError } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class OrderRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async listOrders({ query, userId }: { query: GetOrderListQueryType; userId: number }): Promise<GetOrderListResType> {
    const { page, limit, status } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.OrderWhereInput = {
      userId,
      status
    }
    const [orders, totalItems] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: OrderBy.Desc
        },
        include: {
          snapshots: true
        }
      }),
      this.prismaService.order.count({
        where
      })
    ])
    return {
      orders,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit)
    }
  }

  getOrderDetail({ orderId, userId }: { orderId: number; userId: number }): Promise<GetOrderDetailResType | null> {
    return this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId
      },
      include: {
        snapshots: true
      }
    })
  }

  async createOrder({ body, userId }: { body: CreateOrderBodyType; userId: number }): Promise<CreateOrderResType> {
    const { cartId, couponId } = body
    const coupon = couponId
      ? await this.prismaService.coupon.findUnique({
          where: {
            id: couponId,
            isActive: true,
            startAt: {
              lte: new Date()
            },
            endAt: {
              gte: new Date()
            }
          }
        })
      : null
    if (couponId && !coupon) {
      throw new BadRequestException('Coupon không tồn tại')
    }
    const cart = await this.prismaService.cartItem.findUnique({
      where: {
        id: cartId,
        userId
      },
      include: {
        course: true
      }
    })
    if (!cart) {
      throw new NotFoundException('Cart không tồn tại')
    }
    const totalPrice = getTotalPrice({
      coursePrice: cart.course.price,
      courseDiscount: cart.course.discount,
      couponDiscount: coupon?.discount ?? null,
      couponType: coupon?.couponType ?? null
    })
    const order = await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          couponId,
          status: totalPrice === 0 ? OrderStatus.PAID : OrderStatus.PENDING,
          snapshots: {
            create: {
              courseId: cart.courseId,
              courseImage: cart.course.image,
              courseTitle: cart.course.title,
              coursePrice: cart.course.price,
              courseDiscount: cart.course.discount,
              courseType: cart.course.courseType,
              couponDiscount: coupon?.discount,
              couponType: coupon?.couponType,
              couponStartAt: coupon?.startAt,
              couponEndAt: coupon?.endAt,
              couponId: coupon?.id
            }
          },
          createdById: userId
        }
      })
      await tx.cartItem.delete({
        where: {
          id: cartId
        }
      })
      if (totalPrice === 0) {
        await tx.courseEnrollment.create({
          data: {
            userId,
            courseId: cart.courseId,
            status: CourseEnrollmentStatus.ACTIVE
          }
        })
      } else {
        // cancel job
      }
      return order
    })
    return order
  }

  async cancelOrder({ orderId, userId }: { orderId: number; userId: number }): Promise<OrderType> {
    try {
      const order = await this.prismaService.order.findUniqueOrThrow({
        where: {
          id: orderId,
          userId
        }
      })
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Không thể hủy đơn hàng')
      }
      const orderUpdate = await this.prismaService.order.update({
        where: {
          id: orderId,
          userId
        },
        data: {
          status: OrderStatus.CANCELLED,
          updatedById: userId
        }
      })
      return orderUpdate
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Đơn hàng không tồn tại')
      }
      throw error
    }
  }
}
