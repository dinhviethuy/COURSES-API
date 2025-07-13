import { Injectable } from '@nestjs/common'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class SharedPaymentReporitory {
  constructor(private readonly prismaService: PrismaService) {}

  async cancelOrder(orderId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId
      }
    })
    if (!order) {
      throw new Error('Order not found')
    }
    await this.prismaService.order.update({
      where: {
        id: orderId
      },
      data: {
        status: OrderStatus.CANCELLED
      }
    })
  }
}
