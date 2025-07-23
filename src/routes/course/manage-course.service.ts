import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateCourseBodyType,
  GetManageCoursesQueryType,
  UpdateCourseBodyType,
  ValidateSlugBodyType
} from 'src/routes/course/course.model'
import { CourseRepo } from 'src/routes/course/course.repo'
import { CourseType } from 'src/shared/constants/course.constant'
import { isNotFoundPrismaError, isRequiredConnectPrismaError } from 'src/shared/helpers'

@Injectable()
export class ManageCourseService {
  constructor(private readonly courseRepo: CourseRepo) {}

  async listCourses({ query, roleId, userId }: { query: GetManageCoursesQueryType; roleId: number; userId: number }) {
    return this.courseRepo.listCoursesForAdmin({ query, roleId, userId })
  }

  async getCourseDetailForAdmin({ courseId, roleId, userId }: { courseId: number; roleId: number; userId: number }) {
    try {
      const course = await this.courseRepo.getDetailForAdmin({ courseId, roleId, userId })
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
    updatedById,
    roleId
  }: {
    courseId: number
    data: UpdateCourseBodyType
    updatedById: number
    roleId: number
  }) {
    try {
      const course = await this.courseRepo.updateCourse({ courseId, data, updatedById, roleId })
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
      if (error instanceof HttpException) {
        throw error
      }
      throw error
    }
  }

  async deleteCourse({ courseId, deletedById, roleId }: { courseId: number; deletedById: number; roleId: number }) {
    try {
      await this.courseRepo.deleteCourse({ courseId, deletedById, roleId })
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy khóa học')
      }
      if (error instanceof HttpException) {
        throw error
      }
      throw error
    }
  }

  async reorderChaptersAndLessons({
    courseId,
    chapters,
    updatedById,
    roleId
  }: {
    courseId: number
    chapters: { id: number; order: number; lessons: { id: number; order: number }[] }[]
    updatedById: number
    roleId: number
  }) {
    try {
      await this.courseRepo.reorderChaptersAndLessons({ courseId, chapters, updatedById, roleId })
      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi sắp xếp lại chương và bài học')
    }
  }

  async validateSlug(body: ValidateSlugBodyType) {
    const course = await this.courseRepo.validateSlug({
      slug: body.slug,
      courseId: body.courseId
    })
    if (course) {
      throw new BadRequestException('Slug đã tồn tại')
    }
    return true
  }
}
