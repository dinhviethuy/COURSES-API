import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateOrderBodyType, CreateOrderResType, GetOrderListQueryType } from 'src/routes/order/order.model'
import { OrderRepo } from 'src/routes/order/order.repo'

@Injectable()
export class OrderService {
  constructor(private readonly orderRepo: OrderRepo) {}

  listOrders({ query, userId }: { query: GetOrderListQueryType; userId: number }) {
    return this.orderRepo.listOrders({ query, userId })
  }

  async getOrderDetail({ orderId, userId }: { orderId: number; userId: number }) {
    try {
      const order = await this.orderRepo.getOrderDetail({ orderId, userId })
      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại')
      }
      return order
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi lấy chi tiết đơn hàng')
    }
  }

  createOrder({ body, userId }: { body: CreateOrderBodyType; userId: number }): Promise<CreateOrderResType> {
    return this.orderRepo.createOrder({ body, userId })
  }

  cancelOrder({ orderId, userId }: { orderId: number; userId: number }) {
    return this.orderRepo.cancelOrder({ orderId, userId })
  }
}
