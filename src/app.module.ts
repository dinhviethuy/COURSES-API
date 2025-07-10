import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './routes/auth/auth.module'
import { MediaModule } from './routes/media/media.module'
import { PermissionModule } from './routes/permission/permission.module'
import { ProfileModule } from './routes/profile/profile.module'
import { RoleModule } from './routes/role/role.module'
import { UserModule } from './routes/user/user.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { CustomZodSerializerInterceptor } from './shared/interceptors/custom-zod-serializer.interceptor'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [SharedModule, AuthModule, ProfileModule, PermissionModule, RoleModule, UserModule, MediaModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomZodSerializerInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
