import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { PaymentProducer } from 'src/routes/payment/payment.producrer'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { PaymentController } from './payment.controller'
import { PaymentRepo } from './payment.repo'
import { PaymentService } from './payment.service'

@Module({
  providers: [PaymentService, PaymentRepo, PaymentProducer],
  controllers: [PaymentController],
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME
    })
  ]
})
export class PaymentModule {}
