import { BadRequestException, Injectable } from '@nestjs/common'
import { parse } from 'date-fns'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { PaymentProducer } from 'src/routes/payment/payment.producrer'
import { CourseEnrollmentStatus } from 'src/shared/constants/course-enrollment.constant'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/other.constant'
import { getTotalPrice } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PaymentRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentProducer: PaymentProducer
  ) {}

  async receiver(body: WebhookPaymentBodyType): Promise<number> {
    let amountIn = 0
    let amountOut = 0
    if (body.transferType === 'in') {
      amountIn = body.transferAmount
    } else {
      amountOut = body.transferAmount
    }
    const paymentTransaction = await this.prismaService.payment.findUnique({
      where: {
        id: body.id
      }
    })
    if (paymentTransaction) {
      throw new BadRequestException('Payment transaction already exists')
    }
    const { userId, orderId } = await this.prismaService.$transaction(async (tx) => {
      const orderId = body.code
        ? Number(body.code?.split(PREFIX_PAYMENT_CODE)[1])
        : Number(body.content?.split(PREFIX_PAYMENT_CODE)[1])
      if (isNaN(orderId)) {
        throw new BadRequestException('Invalid order id')
      }
      await tx.payment
        .create({
          data: {
            id: body.id,
            orderId,
            gateway: body.gateway,
            transactionDate: parse(body.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
            accountNumber: body.accountNumber,
            code: body.code,
            transactionContent: body.content,
            referenceNumber: body.referenceCode,
            body: body.description,
            accumulated: body.accumulated,
            subAccount: body.subAccount,
            amountIn,
            amountOut
          }
        })
        .catch((_) => {
          throw new BadRequestException('Cannot create payment transaction')
        })
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
          status: OrderStatus.PENDING
        },
        include: {
          snapshots: true,
          course: {
            include: {
              comboChildren: {
                select: {
                  id: true,
                  isDraft: true,
                  deletedAt: true
                }
              }
            }
          }
        }
      })
      if (!order) {
        throw new BadRequestException('Order not found')
      }
      const totalPrice = getTotalPrice({
        coursePrice: order.snapshots[0].coursePrice,
        courseDiscount: order.snapshots[0].courseDiscount,
        couponDiscount: order.snapshots[0].couponDiscount,
        couponType: order.snapshots[0].couponType
      })
      if (totalPrice !== amountIn) {
        throw new BadRequestException(`Price not match, expected ${totalPrice} but got ${amountIn}`)
      }
      await tx.order.update({
        where: {
          id: orderId
        },
        data: {
          status: OrderStatus.PAID
        }
      })
      const userId = order.userId
      const courseId = order.snapshots[0].courseId
      const courseIds = order.course.comboChildren
        .filter((child) => !child.isDraft && !child.deletedAt)
        .map((child) => child.id)
      courseIds.push(courseId)
      for (const id of courseIds) {
        const courseEnrollment = await tx.courseEnrollment.findFirst({
          where: {
            courseId: id,
            userId
          }
        })
        if (!courseEnrollment) {
          await tx.courseEnrollment.create({
            data: {
              userId,
              courseId: id,
              status: CourseEnrollmentStatus.ACTIVE,
              createdById: userId
            }
          })
        }
      }
      return { userId, orderId }
    })
    await this.paymentProducer.removeJob(orderId).catch((_) => {})
    return userId
  }
}
