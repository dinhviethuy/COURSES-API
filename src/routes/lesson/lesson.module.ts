import { Module } from '@nestjs/common'
import { LessonController } from './lesson.controller'
import { LessonRepo } from './lesson.repo'
import { LessonService } from './lesson.service'
import { ManageLessonService } from './manage-lesson.service'
import { ManageLessonController } from './manage-lesson.controller'

@Module({
  controllers: [LessonController, ManageLessonController],
  providers: [LessonService, ManageLessonService, LessonRepo]
})
export class LessonModule {}
