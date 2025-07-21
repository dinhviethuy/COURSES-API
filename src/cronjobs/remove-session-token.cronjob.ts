import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RemoveSessionTokenCronjob {
  private readonly logger = new Logger(RemoveSessionTokenCronjob.name)
  constructor(private readonly prismaService: PrismaService) {}
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    console.log('1')
    const sessionTokens = await this.prismaService.sessionToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    this.logger.debug(`Removing ${sessionTokens.count} session tokens`)
  }
}
