import { Module } from '@nestjs/common'
import { AuthController } from 'src/routes/auth/auth.controller'
import { AuthRepo } from 'src/routes/auth/auth.repo'
import { AuthService } from 'src/routes/auth/auth.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepo]
})
export class AuthModule {}
