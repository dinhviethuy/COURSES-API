import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { generateQueueJobId } from 'src/shared/helpers'

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private readonly queue: Queue) {}

  async addCancelPaymentJob(orderId: number) {
    await this.queue.add(
      CANCEL_PAYMENT_JOB_NAME,
      { orderId },
      {
        delay: 1000 * 60, // 1minute
        jobId: generateQueueJobId(orderId),
        removeOnComplete: true,
        removeOnFail: true
      }
    )
  }
}
