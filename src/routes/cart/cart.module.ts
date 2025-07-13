import { Module } from '@nestjs/common'
import { CartController } from 'src/routes/cart/cart.controller'
import { CartRepo } from 'src/routes/cart/cart.repo'
import { CartService } from 'src/routes/cart/cart.service'

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepo]
})
export class CartModule {}
