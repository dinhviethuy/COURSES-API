import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { generateRoomId } from 'src/shared/helpers'
import { WebhookPaymentBodyType } from './payment.model'
import { PaymentRepo } from './payment.repo'

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server

  constructor(private readonly paymentRepo: PaymentRepo) {}

  async receiver(body: WebhookPaymentBodyType) {
    const userId = await this.paymentRepo.receiver(body)
    this.server.to(generateRoomId(userId)).emit('payment', {
      status: 'success',
      message: 'Payment received successfully'
    })
    return true
  }
}
