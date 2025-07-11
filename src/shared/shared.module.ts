import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AuthenticationGuard } from './guards/authentication.guard'
import { PaymentAPIKeyGuard } from './guards/payment-api-key.guard'
import { SessionTokenGuard } from './guards/session-token.guard'
import { SharedCourseEnrollmentRepository } from './repositories/shared-course-enrollment.repo'
import { SharedRoleRepository } from './repositories/shared-role.repo'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { EmailService } from './services/email.service'
import { HashingService } from './services/hashing.service'
import { PrismaService } from './services/prisma.service'
import { TokenService } from './services/token.service'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  SharedRoleRepository,
  SharedUserRepository,
  SharedCourseEnrollmentRepository,
  EmailService
]

@Global()
@Module({
  providers: [
    ...sharedServices,
    SessionTokenGuard,
    PaymentAPIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    }
  ],
  exports: sharedServices,
  imports: [JwtModule]
})
export class SharedModule {}
