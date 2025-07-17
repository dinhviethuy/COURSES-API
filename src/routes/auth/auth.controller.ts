import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  ForgotPasswordBodyDTO,
  LoginBodyDTO,
  LoginResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO
} from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { envConfig } from 'src/shared/config'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import { TokenService } from 'src/shared/services/token.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService
  ) {}

  private async setSessionToken(res: Response, sessionToken: string) {
    const { exp } = await this.tokenService.verifySessionToken(sessionToken)
    const expiresAt = new Date(exp * 1000)
    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt
    })
  }

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
  @ZodSerializerDto(RegisterResDTO)
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: RegisterBodyDTO, @Res({ passthrough: true }) res: Response) {
    const { sessionToken, ...user } = await this.authService.register(body)
    await this.setSessionToken(res, sessionToken)
    return user
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  @MessageRes('Đăng nhập thành công')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginBodyDTO, @Res({ passthrough: true }) res: Response) {
    const { sessionToken, ...user } = await this.authService.login(body)
    await this.setSessionToken(res, sessionToken)
    return user
  }

  @Post('logout')
  @MessageRes('Đăng xuất thành công')
  @HttpCode(HttpStatus.OK)
  async logout(
    @ActiveUser('sessionToken') sessionToken: string,
    @Body() _: EmptyBodyDTO,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logout(sessionToken)
    res.clearCookie('sessionToken')
    return true
  }

  @Post('forgot-password')
  @IsPublic()
  @MessageRes('Đổi mật khẩu thành công')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

}
