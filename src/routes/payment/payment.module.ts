import { Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { PaymentRepo } from './payment.repo'
import { PaymentService } from './payment.service'

@Module({
  providers: [PaymentService, PaymentRepo],
  controllers: [PaymentController]
})
export class PaymentModule {}
