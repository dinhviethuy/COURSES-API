import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { OrderController } from 'src/routes/order/order.controller'
import { OrderProducer } from 'src/routes/order/order.producer'
import { OrderRepo } from 'src/routes/order/order.repo'
import { OrderService } from 'src/routes/order/order.service'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'

@Module({
  imports: [BullModule.registerQueue({ name: PAYMENT_QUEUE_NAME })],
  providers: [OrderService, OrderRepo, OrderProducer],
  controllers: [OrderController]
})
export class OrderModule {}
