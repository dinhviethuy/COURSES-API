import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { OTPType, OTPTypeType } from 'src/shared/constants/auth.constant'
import { generateOTP, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { EmailService } from 'src/shared/services/email.service'
import { ForgotPasswordBodyType, LoginBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { AuthRepo } from './auth.repo'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepo,
    private readonly sharedUserRepo: SharedUserRepository,
    private readonly emailService: EmailService
  ) {}

  private async validateOTP({ email, otp, otpType }: { otp: string; email: string; otpType: OTPTypeType }) {
    const verifyOTP = await this.authRepo.findVerifyOTP(email, otpType)
    if (!verifyOTP) {
      throw new BadRequestException('OTP không hợp lệ')
    }
    if (verifyOTP.code !== otp) {
      throw new BadRequestException('OTP không hợp lệ')
    }
    if (verifyOTP.expiresAt < new Date()) {
      throw new BadRequestException('OTP đã hết hạn')
    }
    await this.authRepo.deleteOTP(email, otpType)
    return true
  }

  async sendOTP(body: SendOTPBodyType) {
    const user = await this.sharedUserRepo.findUnique({ email: body.email })
    if (user && body.type === OTPType.REGISTER) {
      throw new ConflictException('Email đã tồn tại')
    }
    if (!user && body.type === OTPType.FORGOT_PASSWORD) {
      throw new NotFoundException('Email không tồn tại')
    }
    const code = generateOTP()
    await this.authRepo.createOTP({
      email: body.email,
      otp: code,
      otpType: body.type
    })
    const { error } = await this.emailService.sendEmail({ to: body.email, otpCode: code })
    if (error) {
      throw new BadRequestException(error.message)
    }
    return true
  }

  async register(body: RegisterBodyType) {
    const { email, password, fullName, otp } = body
    //1. Kiểm tra OTP
    await this.validateOTP({ email, otp, otpType: OTPType.REGISTER })
    //2. Tạo user
    try {
      return this.authRepo.register({
        email,
        password,
        fullName
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email đã tồn tại')
      }
      throw new BadRequestException(error.message)
    }
  }

  async login(body: LoginBodyType) {
    return this.authRepo.login(body)
  }

  async logout(sessionToken: string) {
    return this.authRepo.logout(sessionToken)
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, newPassword, otp } = body
    await this.validateOTP({ email, otp, otpType: OTPType.FORGOT_PASSWORD })
    await this.authRepo.changePassword({ email, newPassword })
    return true
  }

  async sessionToken(sessionToken: string) {
    return this.authRepo.sessionToken(sessionToken)
  }
}
