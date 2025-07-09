import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { OTPType, OTPTypeType } from 'src/shared/constants/auth.constant'
import { generateOTP, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.model'
import { LoginBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { AuthRepo } from './auth.repo'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepo,
    private readonly sharedUserRepo: SharedUserRepository
  ) {}

  private async validateOTP(otp: string, email: string, otpType: OTPTypeType) {
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
    return true
  }

  async sendOTP(body: SendOTPBodyType) {
    const user = await this.sharedUserRepo.findUnique(body.email)
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
    console.log(code)
    return { message: 'Gửi email thành công' }
  }

  async register(body: RegisterBodyType) {
    const { email, password, fullName, otp } = body
    //1. Kiểm tra OTP
    await this.validateOTP(otp, email, OTPType.REGISTER)
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
}
