import { Injectable } from '@nestjs/common'
import OTPEmail from 'emails/otp'
import { Resend } from 'resend'
import { envConfig } from '../config'

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendEmail({ to, otpCode }: { to: string; otpCode: string }) {
    const subject = 'Mã xác thực OTP'
    return this.resend.emails.send({
      from: `noreply@${envConfig.DOMAIN}`,
      to,
      subject,
      react: <OTPEmail otpCode={otpCode} title={subject} />
    })
  }
}
