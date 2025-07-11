import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { CourseType } from 'src/shared/constants/course.constant'
import { isNotFoundPrismaError, isRequiredConnectPrismaError } from 'src/shared/helpers'
import { CreateCourseBodyType, GetManageCoursesQueryType, UpdateCourseBodyType } from './course.model'
import { CourseRepo } from './course.repo'

@Injectable()
export class ManageCourseService {
  constructor(private readonly courseRepo: CourseRepo) {}

  async listCourses(query: GetManageCoursesQueryType) {
    return this.courseRepo.listCoursesForAdmin(query)
  }

  async getCourseDetailForAdmin(courseId: number) {
    try {
      const course = await this.courseRepo.getDetailForAdmin(courseId)
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

  async createCourse(data: CreateCourseBodyType, createdById: number) {
    try {
      const course = await this.courseRepo.createCourse({ data, createdById })
      return course
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy khóa học')
      }
      if (isRequiredConnectPrismaError(error)) {
        if (data.courseType === CourseType.COMBO) {
          throw new BadRequestException('Khóa học con không tồn tại')
        }
      }
      throw error
    }
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
    try {
      const course = await this.courseRepo.updateCourse({ courseId, data, updatedById })
      return course
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Course not found')
      }
      if (isRequiredConnectPrismaError(error)) {
        if (data.courseType === CourseType.COMBO) {
          throw new BadRequestException('Khóa học con không tồn tại')
        }
      }
      throw error
    }
  }

  async deleteCourse({ courseId, deletedById }: { courseId: number; deletedById: number }) {
    try {
      await this.courseRepo.deleteCourse({ courseId, deletedById })
      return {}
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy khóa học')
      }
      throw error
    }
  }

  async reorderChaptersAndLessons({
    courseId,
    chapters,
    updatedById
  }: {
    courseId: number
    chapters: { id: number; order: number; lessons: { id: number; order: number }[] }[]
    updatedById: number
  }) {
    try {
      await this.courseRepo.reorderChaptersAndLessons({ courseId, chapters, updatedById })
      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi sắp xếp lại chương và bài học')
    }
  }
}
