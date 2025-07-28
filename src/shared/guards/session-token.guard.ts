import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Response } from 'express'
import { REQUEST_ROLE_PERMISSIONS, REQUEST_USER_KEY } from 'src/shared/constants/auth.constant'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const sessionToken = this.extractTokenFromCookie(request)
    const payload = await this.validateSessionToken(sessionToken, response)
    request[REQUEST_USER_KEY] = {
      ...payload.payload,
      sessionToken: payload.sessionToken
    }
    await this.validateUserPermission(payload.payload, request)
    return true
  }

  private extractTokenFromCookie(request: any): string {
    const sessionToken = request.cookies['sessionToken']
    if (!sessionToken) {
      throw new UnauthorizedException('Session token là bắt buộc')
    }
    return sessionToken
  }

  private async validateSessionToken(sessionToken: string, response: Response) {
    try {
      const [payload, sessionTokenInDb] = await Promise.all([
        this.tokenService.verifySessionToken(sessionToken),
        this.prismaService.sessionToken.findUnique({
          where: {
            token: sessionToken
          }
        })
      ])
      if (!sessionTokenInDb) {
        throw new UnauthorizedException('Session token không hợp lệ')
      }
      if (sessionTokenInDb.expiresAt < new Date()) {
        throw new UnauthorizedException('Session token đã hết hạn')
      }
      let payloadRes = payload
      const userInDb = await this.prismaService.user.findUnique({
        where: {
          id: payload.userId,
          roleId: payload.roleId
        }
      })
      if (!userInDb) {
        await this.prismaService.sessionToken.delete({
          where: {
            token: sessionToken
          }
        })
        throw new UnauthorizedException('Session token không hợp lệ')
      }
      let sessionTokenRes = sessionToken
      const timeUseSeconds = payload.exp - payload.iat
      const timeUsedSeconds = (Date.now() - sessionTokenInDb.createdAt.getTime()) / 1000
      if (timeUsedSeconds >= timeUseSeconds / 3) {
        sessionTokenRes = this.tokenService.signSessionToken({
          roleId: payload.roleId,
          roleName: payload.roleName,
          userId: payload.userId
        })
        payloadRes = await this.tokenService.verifySessionToken(sessionTokenRes)
        await this.prismaService.sessionToken.update({
          where: {
            token: sessionToken
          },
          data: {
            token: sessionTokenRes,
            expiresAt: new Date(payloadRes.exp * 1000)
          }
        })
        response.cookie('sessionToken', sessionTokenRes, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          expires: new Date(payloadRes.exp * 1000)
        })
      }
      return {
        payload: payloadRes,
        sessionToken: sessionTokenRes
      }
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
