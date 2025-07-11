import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from 'src/shared/helpers'
import { CreateLessonBodyType, UpdateLessonBodyType } from './lesson.model'
import { LessonRepo } from './lesson.repo'

@Injectable()
export class ManageLessonService {
  constructor(private readonly lessonRepo: LessonRepo) {}

  async getDetail(lessonId: number) {
    const lesson = await this.lessonRepo.getDetailAdmin(lessonId)
    if (!lesson) {
      throw new NotFoundException('Bài học không tồn tại')
    }
    return lesson
  }

  async create(data: CreateLessonBodyType, createdById: number) {
    try {
      const lesson = await this.lessonRepo.create(data, createdById)
      return lesson
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new NotAcceptableException('Chapter không tồn tại')
      }
      throw new BadRequestException('Lỗi khi tạo bài học')
    }
  }

  async update({ data, updatedById, lessonId }: { data: UpdateLessonBodyType; updatedById: number; lessonId: number }) {
    try {
      const lesson = await this.lessonRepo.update({ data, updatedById, lessonId })
      return lesson
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new NotAcceptableException('Chapter không tồn tại')
      }
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Bài học không tồn tại')
      }
      throw new BadRequestException('Lỗi khi cập nhật bài học')
    }
  }

  async delete({ lessonId, deletedById }: { lessonId: number; deletedById: number }) {
    try {
      await this.lessonRepo.delete({ lessonId, deletedById })
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Bài học không tồn tại')
      }
      throw new BadRequestException('Lỗi khi xóa bài học')
    }
  }
}
