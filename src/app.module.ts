import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AppController } from 'src/app.controller'
import { AppService } from 'src/app.service'
import { AuthModule } from 'src/routes/auth/auth.module'
import { CartModule } from 'src/routes/cart/cart.module'
import { ChapterModule } from 'src/routes/chapter/chapter.module'
import { CouponModule } from 'src/routes/coupon/coupon.module'
import { CourseModule } from 'src/routes/course/course.module'
import { LessonModule } from 'src/routes/lesson/lesson.module'
import { MediaModule } from 'src/routes/media/media.module'
import { OrderModule } from 'src/routes/order/order.module'
import { PermissionModule } from 'src/routes/permission/permission.module'
import { ProfileModule } from 'src/routes/profile/profile.module'
import { RoleModule } from 'src/routes/role/role.module'
import { UserModule } from 'src/routes/user/user.module'
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter'
import { CustomZodSerializerInterceptor } from 'src/shared/interceptors/custom-zod-serializer.interceptor'
import CustomZodValidationPipe from 'src/shared/pipes/custom-zod-validation.pipe'
import { SharedModule } from 'src/shared/shared.module'

@Module({
  imports: [
    SharedModule,
    AuthModule,
    ProfileModule,
    PermissionModule,
    RoleModule,
    UserModule,
    MediaModule,
    CourseModule,
    ChapterModule,
    LessonModule,
    CouponModule,
    CartModule,
    OrderModule
  ],
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
