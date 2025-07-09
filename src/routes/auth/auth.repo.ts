import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import { envConfig } from 'src/shared/config'
import { OTPTypeType } from 'src/shared/constants/auth.constant'
import { RoleName } from 'src/shared/constants/role.contant'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.model'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { SessionTokenPayloadCreate } from 'src/shared/types/jwt.type'
import { LoginBodyType, LoginResType, RegisterBodyType, RegisterResType } from './auth.model'

@Injectable()
export class AuthRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepo: SharedRoleRepository,
    private readonly tokenService: TokenService,
    private readonly sharedUserRepo: SharedUserRepository
  ) {}

  findVerifyOTP(email: string, otpType: OTPTypeType) {
    return this.prismaService.verificationCode.findUnique({
      where: {
        email_type: {
          email,
          type: otpType
        }
      }
    })
  }
  async createOTP({ email, otp, otpType }: { email: string; otpType: OTPTypeType; otp: string }) {
    await this.prismaService.verificationCode.upsert({
      where: {
        email_type: {
          email,
          type: otpType
        }
      },
      update: {
        code: otp,
        expiresAt: addMilliseconds(new Date(), Number(ms(envConfig.OTP_EXPIRES_IN as any)))
      },
      create: {
        email,
        type: otpType,
        code: otp,
        expiresAt: addMilliseconds(new Date(), Number(ms(envConfig.OTP_EXPIRES_IN as any)))
      }
    })
  }

  async login(body: LoginBodyType): Promise<LoginResType> {
    const { email, password } = body
    const user = await this.sharedUserRepo.findUniqueWithRole(email)
    if (!user) {
      throw new NotFoundException('Email không tồn tại')
    }
    const isPasswordValid = await this.hashingService.compare(password, user.password)
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu không hợp lệ')
    }
    const sessionToken = await this.createSessionToken({
      userId: user.id,
      roleName: user.role.name,
      roleId: user.role.id
    })
    return {
      sessionToken
    }
  }

  async register(body: Omit<RegisterBodyType, 'otp' | 'confirmPassword'>): Promise<RegisterResType> {
    const { email, password, fullName } = body
    const hashedPassword = await this.hashingService.hash(password)
    const roleId = await this.sharedRoleRepo.getStudentRoleId()
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        roleId
      }
    })
    const sessionToken = await this.createSessionToken({
      userId: user.id,
      roleName: RoleName.STUDENT,
      roleId
    })
    return {
      sessionToken
    }
  }

  async logout(sessionToken: string) {
    try {
      await this.tokenService.verifySessionToken(sessionToken)
      // Xóa session token
      await this.prismaService.sessionToken.delete({
        where: {
          token: sessionToken
        }
      })
      return { message: 'Đăng xuất thành công' }
    } catch (error) {
      throw new BadRequestException('Session token không hợp lệ')
    }
  }

  private async createSessionToken({ userId, roleName, roleId }: SessionTokenPayloadCreate) {
    const sessionToken = this.tokenService.signSessionToken({
      roleId,
      roleName,
      userId
    })
    await this.prismaService.sessionToken.create({
      data: {
        token: sessionToken,
        expiresAt: addMilliseconds(new Date(), Number(ms(envConfig.SESSION_TOKEN_EXPIRES_IN as any))),
        userId
      }
    })
    return sessionToken
  }
}
