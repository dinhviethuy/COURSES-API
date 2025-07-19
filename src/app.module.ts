import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AppController } from 'src/app.controller'
import { AppService } from 'src/app.service'
import { PaymentConsumer } from 'src/queue/payment.consumer'
import { AuthModule } from 'src/routes/auth/auth.module'
import { CartModule } from 'src/routes/cart/cart.module'
import { ChapterModule } from 'src/routes/chapter/chapter.module'
import { CouponModule } from 'src/routes/coupon/coupon.module'
import { CourseModule } from 'src/routes/course/course.module'
import { LessonModule } from 'src/routes/lesson/lesson.module'
import { MediaModule } from 'src/routes/media/media.module'
import { OrderModule } from 'src/routes/order/order.module'
import { PaymentModule } from 'src/routes/payment/payment.module'
import { PermissionModule } from 'src/routes/permission/permission.module'
import { ProfileModule } from 'src/routes/profile/profile.module'
import { RoleModule } from 'src/routes/role/role.module'
import { UserModule } from 'src/routes/user/user.module'
import { envConfig } from 'src/shared/config'
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter'
import { CustomZodSerializerInterceptor } from 'src/shared/interceptors/custom-zod-serializer.interceptor'
import CustomZodValidationPipe from 'src/shared/pipes/custom-zod-validation.pipe'
import { SharedModule } from 'src/shared/shared.module'
import { WebSocketModule } from 'src/websockets/websocket.module'

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: envConfig.REDIS_URL
      }
    }),
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
    OrderModule,
    PaymentModule,
    WebSocketModule
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
    },
    PaymentConsumer
  ]
})
export class AppModule {}
