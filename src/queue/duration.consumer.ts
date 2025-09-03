import { Processor, WorkerHost } from '@nestjs/bullmq'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Job } from 'bullmq'
import { Server } from 'socket.io'
import { PROBE_DURATION_JOB_NAME, VIDEO_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { generateRoomId } from 'src/shared/helpers'
import { MediaInfoService } from 'src/shared/services/media-info.service'
import { PrismaService } from 'src/shared/services/prisma.service'

@Processor(VIDEO_QUEUE_NAME)
@WebSocketGateway({ namespace: 'video' })
export class DurationConsumer extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaInfoService: MediaInfoService
  ) {
    super()
  }
  @WebSocketServer()
  server: Server

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case PROBE_DURATION_JOB_NAME: {
        const { key, userId, path } = job.data
        const blobName = key.includes('.') ? key : `${key}.mp4`
        const duration = await this.mediaInfoService.getInfo(blobName)
        console.log('duration', duration)
        const result = await this.prisma.$transaction(async (tx) => {
          const existed = await tx.lesson.findFirst({ where: { key, deletedAt: null } })
          if (existed) {
            return tx.lesson.update({ where: { id: existed.id }, data: { duration } })
          }
          return null
        })
        if (result) {
          this.server.to(generateRoomId(userId)).emit('duration', {
            status: 'success',
            message: 'Duration received successfully',
            id: result.id,
            key,
            duration
          })
        }
        break
      }
      default:
        break
    }
  }
}
