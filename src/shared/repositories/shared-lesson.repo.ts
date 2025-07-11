import { ForbiddenException, Injectable } from '@nestjs/common'
import { SharedCourseEnrollmentRepository } from './shared-course-enrollment.repo'
import { SharedRoleRepository } from './shared-role.repo'

@Injectable()
export class SharedLessonRepository {
  constructor(
    private readonly sharedCourseEnrollmentRepository: SharedCourseEnrollmentRepository,
    private readonly sharedRoleRepository: SharedRoleRepository
  ) {}

  async checkCanAccessLesson({
    where,
    key,
    roleId,
    lessonId
  }: {
    key?: string
    where: { userId: number } | { courseId: number }
    roleId: number
    lessonId?: number
  }) {
    const [adminRoleId, teacherRoleId] = await Promise.all([
      this.sharedRoleRepository.getAdminRoleId(),
      this.sharedRoleRepository.getTeacherRoleId()
    ])
    const canAccessAdmin = roleId === adminRoleId || roleId === teacherRoleId
    if (!canAccessAdmin) {
      const enrollment = await this.sharedCourseEnrollmentRepository.getEnrollmentByUserId({
        where,
        key,
        lessonId
      })
      if (!enrollment) {
        throw new ForbiddenException('Bạn không có quyền truy cập bài học này')
      }
    }
    return true
  }
}
