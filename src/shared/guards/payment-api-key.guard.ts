import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { envConfig } from '../config'

@Injectable()
export class PaymentAPIKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const paymentAPIKey = request.headers['authorization']?.split(' ')[1]
    if (paymentAPIKey !== envConfig.PAYMENT_API_KEY) {
      throw new UnauthorizedException('Mã API Key thanh toán không hợp lệ')
    }
    return true
  }
}
