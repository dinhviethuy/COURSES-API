import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { PaymentAPIKeyGuard } from 'src/shared/guards/payment-api-key.guard'
import { SessionTokenGuard } from 'src/shared/guards/session-token.guard'
import { SharedCourseEnrollmentRepository } from 'src/shared/repositories/shared-course-enrollment.repo'
import { SharedLessonRepository } from 'src/shared/repositories/shared-lesson.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { EmailService } from 'src/shared/services/email.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  SharedRoleRepository,
  SharedUserRepository,
  SharedCourseEnrollmentRepository,
  SharedLessonRepository,
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
