import { Injectable, NotFoundException } from '@nestjs/common'
import { LessonRepo } from 'src/routes/lesson/lesson.repo'
import { SharedLessonRepository } from 'src/shared/repositories/shared-lesson.repo'

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepo: LessonRepo,
    private readonly sharedLessonRepo: SharedLessonRepository
  ) {}

  async getDetail({ lessonId, userId, roleId }: { lessonId: number; userId: number; roleId: number }) {
    await this.sharedLessonRepo.checkCanAccessLesson({ where: { userId }, roleId, lessonId })
    const hasCompletedAllPreviousLessons = await this.lessonRepo.hasCompletedAllPreviousLessons({ lessonId, userId })
    if (!hasCompletedAllPreviousLessons) {
      throw new NotFoundException('Bạn chưa hoàn thành tất cả bài học trước đó')
    }
    const lesson = await this.lessonRepo.getDetailClient(lessonId)
    if (!lesson) {
      throw new NotFoundException('Bài học không tồn tại')
    }
    return lesson
  }

  async completeLesson({ lessonId, userId, roleId }: { lessonId: number; userId: number; roleId: number }) {
    await this.sharedLessonRepo.checkCanAccessLesson({ where: { userId }, roleId, lessonId })
    const hasCompletedAllPreviousLessons = await this.lessonRepo.hasCompletedAllPreviousLessons({ lessonId, userId })
    if (!hasCompletedAllPreviousLessons) {
      throw new NotFoundException('Bạn chưa hoàn thành tất cả bài học trước đó')
    }
    await this.lessonRepo.completeLesson({ lessonId, userId })
  }
}
