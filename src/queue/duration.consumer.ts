// duration.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Job } from 'bullmq'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { Server } from 'socket.io'
import { PROBE_DURATION_JOB_NAME, VIDEO_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { generateRoomId } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'
const execFileAsync = promisify(execFile)

@Processor(VIDEO_QUEUE_NAME)
@WebSocketGateway({ namespace: 'video' })
export class DurationProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super()
  }
  @WebSocketServer()
  server: Server

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case PROBE_DURATION_JOB_NAME: {
        const { path, key, userId } = job.data
        const { stdout } = await execFileAsync('ffprobe', [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'default=noprint_wrappers=1:nokey=1',
          path
        ])
        const duration = Math.round(Math.max(0, parseFloat(stdout.trim()) || 0))
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
            id: result.id
          })
        }
        break
      }
      default:
        break
    }
  }
}
