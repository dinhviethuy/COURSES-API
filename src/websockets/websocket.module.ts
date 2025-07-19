import { Module } from '@nestjs/common'
import { PaymentGateway } from 'src/websockets/payment.gateway'

@Module({
  providers: [PaymentGateway]
})
export class WebSocketModule {}
