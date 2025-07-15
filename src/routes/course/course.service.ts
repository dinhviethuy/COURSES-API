import { HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { GetCoursesQueryType } from 'src/routes/course/course.model'
import { CourseRepo } from 'src/routes/course/course.repo'

@Injectable()
export class CourseService {
  constructor(private readonly courseRepo: CourseRepo) {}

  async listCourses(query: GetCoursesQueryType) {
    return this.courseRepo.listCourses(query)
  }

  async getCourseDetail(where: {id: number} | {slug: string}) {
    try {
      const course = await this.courseRepo.getCourseDetail(where)
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
