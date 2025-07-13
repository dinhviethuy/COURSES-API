import { Module } from '@nestjs/common'
import { CourseController } from 'src/routes/course/course.controller'
import { CourseRepo } from 'src/routes/course/course.repo'
import { CourseService } from 'src/routes/course/course.service'
import { ManageCourseController } from 'src/routes/course/manage-course.controller'
import { ManageCourseService } from 'src/routes/course/manage-course.service'

@Module({
  controllers: [CourseController, ManageCourseController],
  providers: [CourseService, CourseRepo, ManageCourseService]
})
export class CourseModule {}
