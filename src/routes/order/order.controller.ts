import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateOrderBodyDTO,
  CreateOrderResDTO,
  GetOrderDetailResDTO,
  GetOrderListQueryDTO,
  GetOrderListResDTO,
  GetOrderParamDTO
} from 'src/routes/order/order.dto'
import { OrderService } from 'src/routes/order/order.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ZodSerializerDto(GetOrderListResDTO)
  @MessageRes('Lấy danh sách đơn hàng thành công')
  listOrders(@Query() query: GetOrderListQueryDTO, @ActiveUser('userId') userId: number) {
    return this.orderService.listOrders({ query, userId })
  }

  @Get(':orderId')
  @ZodSerializerDto(GetOrderDetailResDTO)
  @MessageRes('Lấy chi tiết đơn hàng thành công')
  getOrderDetail(@Param() params: GetOrderParamDTO, @ActiveUser('userId') userId: number) {
    return this.orderService.getOrderDetail({ orderId: params.orderId, userId })
  }

  @Post()
  @ZodSerializerDto(CreateOrderResDTO)
  @MessageRes('Tạo đơn hàng thành công')
  createOrder(@Body() body: CreateOrderBodyDTO, @ActiveUser('userId') userId: number) {
    return this.orderService.createOrder({ body, userId })
  }

  @Put(':orderId')
  @MessageRes('Hủy đơn hàng thành công')
  cancelOrder(@Param() params: GetOrderParamDTO, @ActiveUser('userId') userId: number) {
    return this.orderService.cancelOrder({ orderId: params.orderId, userId })
  }
}
