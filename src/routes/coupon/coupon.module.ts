import { Module } from '@nestjs/common'
import { CouponController } from 'src/routes/coupon/coupon.controller'
import { CouponRepo } from 'src/routes/coupon/coupon.repo'
import { CouponService } from 'src/routes/coupon/coupon.service'

@Module({
  controllers: [CouponController],
  providers: [CouponService, CouponRepo]
})
export class CouponModule {}
