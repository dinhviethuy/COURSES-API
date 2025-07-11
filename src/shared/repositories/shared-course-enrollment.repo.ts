import { Injectable } from '@nestjs/common'
import { CourseEnrollmentStatus } from '../constants/course-enrollment.constant'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class SharedCourseEnrollmentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  getEnrollment(courseId: number, userId: number) {
    return this.prismaService.courseEnrollment.findUnique({
      where: {
        courseId_userId: {
          userId,
          courseId
        },
        status: CourseEnrollmentStatus.ACTIVE
      }
    })
  }
}
