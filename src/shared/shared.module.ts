import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AuthenticationGuard } from './guards/authentication.guard'
import { PaymentAPIKeyGuard } from './guards/payment-api-key.guard'
import { SessionTokenGuard } from './guards/session-token.guard'
import { HasingService } from './services/hashing.service'
import { PrismaService } from './services/prisma.service'
import { TokenService } from './services/token.service'

const sharedServices = [PrismaService, HasingService, TokenService]

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
