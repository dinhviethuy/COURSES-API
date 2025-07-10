import { Injectable } from '@nestjs/common'
import { CreateCourseBodyType, GetManageCoursesQueryType, UpdateCourseBodyType } from './course.model'
import { CourseRepo } from './course.repo'

@Injectable()
export class ManageCourseService {
  constructor(private readonly courseRepo: CourseRepo) {}

  async listCourses(query: GetManageCoursesQueryType) {
    return this.courseRepo.listCoursesForAdmin(query)
  }

  async getCourseDetailForAdmin(courseId: number) {
    return this.courseRepo.getDetailForAdmin(courseId)
  }

  async createCourse(data: CreateCourseBodyType, createdById: number) {
    return this.courseRepo.createCourse({ data, createdById })
  }

  async updateCourse({
    courseId,
    data,
    updatedById
  }: {
    courseId: number
    data: UpdateCourseBodyType
    updatedById: number
  }) {
    return this.courseRepo.updateCourse({ courseId, data, updatedById })
  }

  async deleteCourse({ courseId, deletedById }: { courseId: number; deletedById: number }) {
    await this.courseRepo.deleteCourse({ courseId, deletedById })
    return {}
  }
}
