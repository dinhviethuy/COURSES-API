import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCartBodyDTO,
  CreateCartResDTO,
  GetCartParamsDTO,
  GetListCartQueryDTO,
  GetListCartResDTO
} from 'src/routes/cart/cart.dto'
import { CartService } from 'src/routes/cart/cart.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @MessageRes('Lấy danh sách giỏ hàng thành công')
  @ZodSerializerDto(GetListCartResDTO)
  listCart(@Query() query: GetListCartQueryDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.listCart(query, userId)
  }

  @Post()
  @MessageRes('Thêm khóa học vào giỏ hàng thành công')
  @ZodSerializerDto(CreateCartResDTO)
  createCart(@Body() body: CreateCartBodyDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.createCart({ ...body, userId })
  }

  @Delete(':cartId')
  @MessageRes('Xóa khóa học khỏi giỏ hàng thành công')
  deleteCart(@Param() params: GetCartParamsDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.deleteCart({ cartId: params.cartId, userId })
  }
}
