import { BadRequestException, Injectable } from '@nestjs/common'
import { CourseEnrollmentStatus } from '../constants/course-enrollment.constant'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class SharedCourseEnrollmentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  getEnrollmentByUserId({
    where,
    key,
    lessonId
  }: {
    where: { userId: number } | { courseId: number }
    key?: string
    lessonId?: number
  }) {
    if (key === undefined && lessonId === undefined) {
      throw new BadRequestException('Lỗi khi kiểm tra quyền truy cập bài học')
    }
    return this.prismaService.courseEnrollment.findFirst({
      where: {
        ...where,
        status: CourseEnrollmentStatus.ACTIVE,
        course: {
          deletedAt: null,
          isDraft: false,
          chapters: {
            some: {
              deletedAt: null,
              isDraft: false,
              lessons: {
                some: {
                  id: lessonId,
                  deletedAt: null,
                  isDraft: false,
                  key
                }
              }
            }
          }
        }
      }
    })
  }
}
