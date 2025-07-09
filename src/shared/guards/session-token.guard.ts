import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { USER_KEY } from '../constants/user.contant'
import { TokenService } from '../services/token.service'

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const sessionToken = this.extractTokenFromHeader(request)
    const payload = await this.validateSessionToken(sessionToken)
    request[USER_KEY] = {
      ...payload,
      sessionToken
    }
    return true
  }

  private extractTokenFromHeader(request: any): string {
    const sessionToken = request.headers['authorization']?.split(' ')[1]
    if (!sessionToken) {
      throw new UnauthorizedException('Session token is required')
    }
    return sessionToken
  }

  private async validateSessionToken(sessionToken: string) {
    try {
      const payload = await this.tokenService.verifySessionToken(sessionToken)
      return payload
    } catch (error) {
      throw new UnauthorizedException('Invalid session token')
    }
  }
}
