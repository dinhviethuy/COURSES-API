import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import {
  ForgotPasswordBodyDTO,
  LoginBodyDTO,
  LoginResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  SessionTokenResDTO
} from './auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  @IsPublic()
  @MessageRes('Gửi OTP thành công')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('register')
  @IsPublic()
  @MessageRes('Đăng ký thành công')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('login')
  @IsPublic()
  @MessageRes('Đăng nhập thành công')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResDTO)
  async login(@Body() body: LoginBodyDTO) {
    return this.authService.login(body)
  }

  @Post('logout')
  @MessageRes('Đăng xuất thành công')
  @HttpCode(HttpStatus.OK)
  logout(@ActiveUser('sessionToken') sessionToken: string, @Body() _: EmptyBodyDTO) {
    return this.authService.logout(sessionToken)
  }

  @Post('forgot-password')
  @IsPublic()
  @MessageRes('Đổi mật khẩu thành công')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

  @Post('session-token')
  @MessageRes('Lấy session token thành công')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(SessionTokenResDTO)
  sessionToken(@ActiveUser('sessionToken') sessionToken: string, @Body() _: EmptyBodyDTO) {
    return this.authService.sessionToken(sessionToken)
  }
}
