import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CartType,
  CreateCartBodyType,
  CreateCartResType,
  GetCartQueryType,
  GetListCartResType
} from 'src/routes/cart/cart.model'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { SortBy } from 'src/shared/constants/other.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CartRepo {
  constructor(private readonly prismaService: PrismaService) {}

  private generateFilter(query: GetCartQueryType) {
    const { orderBy, sortBy, limit, page } = query
    let order: Prisma.CartItemOrderByWithRelationInput
    if (sortBy === SortBy.CreatedAt) {
      order = {
        [sortBy]: orderBy
      }
    } else {
      order = {
        course: {
          [sortBy]: orderBy
        }
      }
    }
    return {
      orderBy: order,
      skip: (page - 1) * limit,
      take: limit
    }
  }

  async listCart(query: GetCartQueryType, userId: number): Promise<GetListCartResType> {
    const { skip, take, orderBy } = this.generateFilter(query)
    const [cartItems, totalItems] = await Promise.all([
      this.prismaService.cartItem.findMany({
        where: {
          userId,
          deletedAt: null
        },
        ...(!query.getAll && {
          skip,
          take
        }),
        include: {
          course: {
            select: {
              id: true,
              title: true,
              image: true,
              price: true,
              discount: true,
              slug: true,
              courseType: true
            }
          }
        },
        orderBy
      }),
      this.prismaService.cartItem.count({
        where: {
          userId,
          deletedAt: null
        }
      })
    ])
    return {
      cartItems,
      totalItems,
      page: query.page,
      limit: query.getAll ? totalItems : query.limit,
      totalPages: query.getAll ? 1 : Math.ceil(totalItems / query.limit)
    }
  }

  async createCart(body: CreateCartBodyType & { userId: number }): Promise<CreateCartResType> {
    const order = await this.prismaService.order.findFirst({
      where: {
        userId: body.userId,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PAID]
        },
        snapshots: {
          some: {
            courseId: body.courseId
          }
        }
      },
      include: {
        snapshots: true
      }
    })
    if (order) {
      if (order.status === OrderStatus.PENDING) {
        throw new BadRequestException('Bạn đang có đơn hàng chưa thanh toán')
      } else if (order.status === OrderStatus.PAID) {
        throw new BadRequestException('Bạn đã thanh toán đơn hàng này')
      }
    }
    const course = await this.prismaService.course.findUnique({
      where: {
        id: body.courseId,
        deletedAt: null,
        isDraft: false
      }
    })
    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học')
    }
    return this.prismaService.cartItem.create({
      data: body
    })
  }

  deleteCart({ cartId, userId }: { cartId: number; userId: number }, isHard?: boolean): Promise<CartType> {
    return isHard
      ? this.prismaService.cartItem.delete({
          where: {
            id: cartId,
            userId
          }
        })
      : this.prismaService.cartItem.update({
          where: {
            id: cartId,
            userId
          },
          data: {
            deletedAt: new Date()
          }
        })
  }
}
