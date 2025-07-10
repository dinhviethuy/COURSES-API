import { Module } from '@nestjs/common'
import { CourseController } from './course.controller'
import { CourseRepo } from './course.repo'
import { CourseService } from './course.service'
import { ManageCourseController } from './manage-course.controller'
import { ManageCourseService } from './manage-course.service'

@Module({
  controllers: [CourseController, ManageCourseController],
  providers: [CourseService, CourseRepo, ManageCourseService]
})
export class CourseModule {}
