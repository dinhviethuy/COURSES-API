import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateCartBodyType, GetCartQueryType } from 'src/routes/cart/cart.model'
import { CartRepo } from 'src/routes/cart/cart.repo'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class CartService {
  constructor(private readonly cartRepo: CartRepo) {}

  listCart(query: GetCartQueryType, userId: number) {
    return this.cartRepo.listCart(query, userId)
  }

  async createCart(body: CreateCartBodyType & { userId: number }) {
    try {
      const cart = await this.cartRepo.createCart(body)
      return cart
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Course đã tồn tại trong giỏ hàng')
      }
      throw error
    }
  }

  async deleteCart({ cartId, userId }: { cartId: number; userId: number }) {
    try {
      await this.cartRepo.deleteCart({ cartId, userId }, true)
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy item trong giỏ hàng')
      }
      throw error
    }
  }
}
