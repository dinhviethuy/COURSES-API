import { Module } from '@nestjs/common'
import { ChapterController } from 'src/routes/chapter/chapter.controller'
import { ChapterRepo } from 'src/routes/chapter/chapter.repo'
import { ChapterService } from 'src/routes/chapter/chapter.service'

@Module({
  controllers: [ChapterController],
  providers: [ChapterService, ChapterRepo]
})
export class ChapterModule {}
