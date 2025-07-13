import { Injectable } from '@nestjs/common'
import { WebhookPaymentBodyType } from './payment.model'
import { PaymentRepo } from './payment.repo'

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepo) {}

  async receiver(body: WebhookPaymentBodyType) {
    await this.paymentRepo.receiver(body)
    return true
  }
}
