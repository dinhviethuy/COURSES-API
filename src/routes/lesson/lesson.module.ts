import { Module } from '@nestjs/common'
import { LessonController } from 'src/routes/lesson/lesson.controller'
import { LessonRepo } from 'src/routes/lesson/lesson.repo'
import { LessonService } from 'src/routes/lesson/lesson.service'
import { ManageLessonController } from 'src/routes/lesson/manage-lesson.controller'
import { ManageLessonService } from 'src/routes/lesson/manage-lesson.service'

@Module({
  controllers: [LessonController, ManageLessonController],
  providers: [LessonService, ManageLessonService, LessonRepo]
})
export class LessonModule {}
