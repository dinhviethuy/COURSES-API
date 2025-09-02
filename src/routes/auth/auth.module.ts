import { Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthController } from 'src/routes/auth/auth.controller'
import { AuthRepo } from 'src/routes/auth/auth.repo'
import { AuthService } from 'src/routes/auth/auth.service'

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20
        }
      ]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepo]
})
export class AuthModule {}
