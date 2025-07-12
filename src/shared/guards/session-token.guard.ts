import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { HTTPMethod } from 'generated/prisma'
import { REQUEST_ROLE_PERMISSIONS, REQUEST_USER_KEY } from '../constants/auth.constant'
import { PrismaService } from '../services/prisma.service'
import { TokenService } from '../services/token.service'
import { SessionTokenPayload } from '../types/jwt.type'

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const sessionToken = this.extractTokenFromHeader(request)
    const payload = await this.validateSessionToken(sessionToken)
    request[REQUEST_USER_KEY] = {
      ...payload,
      sessionToken
    }
    await this.validateUserPermission(payload, request)
    return true
  }

  private extractTokenFromHeader(request: any): string {
    const sessionToken = request.headers['authorization']?.split(' ')[1]
    if (!sessionToken) {
      throw new UnauthorizedException('Session token là bắt buộc')
    }
    return sessionToken
  }

  private async validateSessionToken(sessionToken: string) {
    try {
      const payload = await this.tokenService.verifySessionToken(sessionToken)
      return payload
    } catch (error) {
      throw new UnauthorizedException('Session token không hợp lệ')
    }
  }

  private async validateUserPermission(decodeSessionToken: SessionTokenPayload, request: any): Promise<void> {
    const roleId: number = decodeSessionToken.roleId
    const path: string = request.route.path
    const method = request.method as keyof typeof HTTPMethod
    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: {
          id: roleId,
          deletedAt: null,
          isActive: true
        },
        include: {
          permissions: {
            where: {
              deletedAt: null,
              path,
              method
            }
          }
        }
      })
      .catch(() => {
        throw new ForbiddenException('Bạn không có quyền truy cập')
      })
    const canAccess = role.permissions.length > 0
    if (!canAccess) {
      throw new ForbiddenException('Bạn không có quyền truy cập')
    }
    request[REQUEST_ROLE_PERMISSIONS] = role
  }
}
