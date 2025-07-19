import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ namespace: 'payment' })
export class PaymentGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('create-payment')
  createPayment(@MessageBody() data: string) {
    this.server.emit('payment-created', {
      message: 'Payment created',
      data
    })
  }
}
