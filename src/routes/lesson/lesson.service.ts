import { Injectable, NotFoundException } from '@nestjs/common'
import { SharedLessonRepository } from 'src/shared/repositories/shared-lesson.repo'
import { LessonRepo } from './lesson.repo'

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepo: LessonRepo,
    private readonly sharedLessonRepo: SharedLessonRepository
  ) {}

  async getDetail({ lessonId, userId, roleId }: { lessonId: number; userId: number; roleId: number }) {
    await this.sharedLessonRepo.checkCanAccessLesson({ where: { userId }, roleId, lessonId })
    const lesson = await this.lessonRepo.getDetailClient(lessonId)
    if (!lesson) {
      throw new NotFoundException('Bài học không tồn tại')
    }
    return lesson
  }
}
