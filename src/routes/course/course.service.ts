import { Injectable } from '@nestjs/common'
import { CourseRepo } from './course.repo'
import { GetCoursesQueryType } from './course.model'

@Injectable()
export class CourseService {
  constructor(private readonly courseRepo: CourseRepo) {}

  async listCourses(query: GetCoursesQueryType) {
    return this.courseRepo.listCourses(query)
  }

  async getCourseDetail(courseId: number) {
    return this.courseRepo.getCourseDetail(courseId)
  }
}
