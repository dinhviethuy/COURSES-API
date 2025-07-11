import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { SharedCourseEnrollmentRepository } from 'src/shared/repositories/shared-course-enrollment.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { LessonRepo } from './lesson.repo'

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepo: LessonRepo,
    private readonly sharedCourseEnrollmentRepo: SharedCourseEnrollmentRepository,
    private readonly sharedRoleRepo: SharedRoleRepository
  ) {}

  async getDetail({ lessonId, userId, roleId }: { lessonId: number; userId: number; roleId: number }) {
    const [adminRoleId, teacherRoleId, enrollment] = await Promise.all([
      this.sharedRoleRepo.getAdminRoleId(),
      this.sharedRoleRepo.getTeacherRoleId(),
      this.sharedCourseEnrollmentRepo.getEnrollment(lessonId, userId)
    ])
    if (roleId === adminRoleId || roleId === teacherRoleId || enrollment) {
      const lesson = await this.lessonRepo.getDetailClient(lessonId)
      if (!lesson) {
        throw new NotFoundException('Bài học không tồn tại')
      }
      return lesson
    }

    throw new ForbiddenException('Bạn không có quyền truy cập bài học này')
  }
}
