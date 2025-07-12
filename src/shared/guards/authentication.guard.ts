import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthType, AuthTypeType, ConditionGuard } from '../constants/auth.constant'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorator'
import { PaymentAPIKeyGuard } from './payment-api-key.guard'
import { SessionTokenGuard } from './session-token.guard'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private authTypeGuardMap: Record<AuthTypeType, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly sessionTokenGuard: SessionTokenGuard,
    private readonly paymentAPIKeyGuard: PaymentAPIKeyGuard
  ) {
    this.authTypeGuardMap = {
      [AuthType.None]: { canActivate: () => true },
      [AuthType.Session]: this.sessionTokenGuard,
      [AuthType.PaymentAPIKey]: this.paymentAPIKeyGuard
    }
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.getAuthTypeValue(context)
    const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])
    return authTypeValue.options.condition === ConditionGuard.And
      ? this.handleAndCondition(guards, context)
      : this.handleOrCondition(guards, context)
  }

  private getAuthTypeValue(context: ExecutionContext): AuthTypeDecoratorPayload {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass()
    ]) ?? { authTypes: [AuthType.Session], options: { condition: ConditionGuard.And } }
    return authTypeValue
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context))) {
          throw new UnauthorizedException('Bạn không có quyền truy cập')
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }
        throw new UnauthorizedException('Bạn không có quyền truy cập')
      }
    }
    return true
  }

  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    let error: any = null
    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) {
          return true
        }
      } catch (e) {
        if (e instanceof HttpException) {
          error = e
        }
      }
    }
    if (error instanceof HttpException) {
      throw error
    }
    throw new UnauthorizedException('Bạn không có quyền truy cập')
  }
}
