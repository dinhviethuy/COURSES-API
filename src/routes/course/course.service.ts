import { HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { GetCoursesQueryType } from './course.model'
import { CourseRepo } from './course.repo'

@Injectable()
export class CourseService {
  constructor(private readonly courseRepo: CourseRepo) {}

  async listCourses(query: GetCoursesQueryType) {
    return this.courseRepo.listCourses(query)
  }

  async getCourseDetail(courseId: number) {
    try {
      const course = await this.courseRepo.getCourseDetail(courseId)
      if (!course) {
        throw new NotFoundException('Không tìm thấy khóa học')
      }
      return course
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new NotFoundException('Không tìm thấy khóa học')
    }
  }
}
