import { Module } from '@nestjs/common'
import { ChapterController } from './chapter.controller'
import { ChapterRepo } from './chapter.repo'
import { ChapterService } from './chapter.service'

@Module({
  controllers: [ChapterController],
  providers: [ChapterService, ChapterRepo]
})
export class ChapterModule {}
