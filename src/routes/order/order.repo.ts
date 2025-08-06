import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Prisma } from '@prisma/client'
import { Server } from 'socket.io'
import {
  CreateOrderBodyType,
  GetOrderDetailResType,
  GetOrderListQueryType,
  GetOrderListResType,
  OrderType
} from 'src/routes/order/order.model'
import { OrderProducer } from 'src/routes/order/order.producer'
import { CourseEnrollmentStatus } from 'src/shared/constants/course-enrollment.constant'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { generateRoomId, getTotalPrice, isNotFoundPrismaError } from 'src/shared/helpers'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TelegramService } from 'src/shared/services/telegram.service'

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class OrderRepo {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
    private readonly sharedRoleRepo: SharedRoleRepository,
    private readonly telegramService: TelegramService
  ) {}

  private async checkForAdmin(roleId?: number) {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return roleId === adminRoleId
  }

  async listOrders({ query, userId }: { query: GetOrderListQueryType; userId: number }): Promise<GetOrderListResType> {
    const { page, limit, status, getAll } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.OrderWhereInput = {
      userId,
      status
    }
    const limitOffsetClause = getAll
      ? Prisma.sql`` // Nếu getAll là true, không thêm LIMIT/OFFSET
      : Prisma.sql`LIMIT ${take} OFFSET ${skip}` // Ngược lại, thêm LIMIT/OFFSET

    // Sửa lỗi: $queryRawUnsafe chỉ nhận string, không nhận Prisma.sql
    // Chuyển Prisma.sql thành string, chèn giá trị trực tiếp (cẩn thận injection)
    // Ở đây userId, limit, offset đều là number đã kiểm soát, an toàn để chèn trực tiếp

    const limitOffsetString = query.getAll ? '' : `LIMIT ${take} OFFSET ${skip}`

    const rawQuery = `
      SELECT
        o.*,
        json_agg(
          json_build_object(
            'id', s."id",
            'orderId', s."orderId",
            'couponId', s."couponId",
            'createdAt', s."createdAt",
            'courseId', s."courseId",
            'courseTitle', s."courseTitle",
            'courseImage', s."courseImage",
            'coursePrice', s."coursePrice",
            'courseDiscount', s."courseDiscount",
            'courseType', s."courseType",
            'couponDiscount', s."couponDiscount",
            'couponType', s."couponType",
            'couponStartAt', s."couponStartAt",
            'couponEndAt', s."couponEndAt",
            'couponCode', s."couponCode",
            'course', CASE
              WHEN c."isDraft" = false AND c."deletedAt" IS NULL THEN
                json_build_object(
                  'title', c."title",
                  'slug', c."slug",
                  'image', c."image"
                )
              ELSE NULL
            END
          )
        ) AS snapshots
      FROM "Order" o
      JOIN "OrderItemSnapshot" s ON s."orderId" = o."id"
      LEFT JOIN "Course" c ON c."id" = s."courseId"
      WHERE o."userId" = ${userId}
      GROUP BY o."id"
      ORDER BY o."createdAt" DESC
      ${limitOffsetString}
    `

    const [orders, totalItems] = await Promise.all([
      this.prismaService.$queryRawUnsafe<GetOrderListResType['orders']>(rawQuery),
      this.prismaService.order.count({
        where
      })
    ])
    return {
      orders,
      totalItems,
      page,
      limit: query.getAll ? totalItems : limit,
      totalPages: query.getAll ? 1 : Math.ceil(totalItems / limit)
    }
  }

  getOrderDetail({ orderId, userId }: { orderId: number; userId: number }): Promise<GetOrderDetailResType | null> {
    return this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId
      },
      include: {
        snapshots: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })
  }

  async createOrder({ body, userId }: { body: CreateOrderBodyType; userId: number }): Promise<any> {
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
        course: {
          include: {
            comboChildren: true,
            createdBy: {
              select: {
                id: true,
                roleId: true
              }
            }
          }
        },
        user: {
          select: {
            email: true
          }
        }
      }
    })
    if (!cart) {
      throw new NotFoundException('Cart không tồn tại')
    }
    if (coupon) {
      const isAdminCreate = await this.checkForAdmin(coupon.createdBy?.roleId)
      if (!isAdminCreate && cart.course.createdById !== coupon.createdById) {
        throw new ForbiddenException('Coupon không hợp lệ')
      }
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
          courseId: cart.courseId,
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
              couponId: coupon?.id,
              couponCode: coupon?.code
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
        const courseIds = cart.course.comboChildren
          .filter((child) => !child.isDraft && !child.deletedAt)
          .map((child) => child.id)
        courseIds.push(cart.courseId)
        for (const id of courseIds) {
          const courseEnrollment = await tx.courseEnrollment.findFirst({
            where: {
              courseId: id,
              userId,
              deletedAt: null
            }
          })
          if (!courseEnrollment) {
            await tx.courseEnrollment.create({
              data: {
                userId,
                courseId: id,
                status: CourseEnrollmentStatus.ACTIVE,
                createdById: userId
              }
            })
          }
        }
        this.server.to(generateRoomId(userId)).emit('payment', {
          status: 'success',
          message: 'Payment received successfully'
        })
        await this.telegramService
          .sendMessageBuySuccess({
            email: cart.user.email,
            titleCourse: cart.course.title,
            totalPrice: totalPrice.toString()
          })
          .catch((_) => {})
      }
      return order
    })
    if (totalPrice !== 0) {
      await this.orderProducer.addCancelPaymentJob(order.id).catch((_) => {})
    }
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
