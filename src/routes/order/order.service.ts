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

  async createOrder({ body, userId }: { body: CreateOrderBodyType; userId: number }): Promise<CreateOrderResType> {
    try {
      const order = await this.orderRepo.createOrder({ body, userId })
      return order
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi tạo đơn hàng')
    }
  }

  async cancelOrder({ orderId, userId }: { orderId: number; userId: number }) {
    try {
      await this.orderRepo.cancelOrder({ orderId, userId })
      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi hủy đơn hàng')
    }
  }
}
