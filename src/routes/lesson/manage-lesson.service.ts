import {
  BadRequestException,
  HttpException,
  Injectable,
  NotAcceptableException,
  NotFoundException
} from '@nestjs/common'
import { CreateLessonBodyType, UpdateLessonBodyType } from 'src/routes/lesson/lesson.model'
import { LessonRepo } from 'src/routes/lesson/lesson.repo'
import { LessonType } from 'src/shared/constants/lesson.constant'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'

@Injectable()
export class ManageLessonService {
  constructor(private readonly lessonRepo: LessonRepo) {}

  async getDetail({ lessonId, roleId, userId }: { lessonId: number; roleId: number; userId: number }) {
    const lesson = await this.lessonRepo.getDetailAdmin({ lessonId, roleId, userId })
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
      if (isUniqueConstraintPrismaError(error)) {
        throw new NotAcceptableException('Bài học đã tồn tại')
      }
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi tạo bài học')
    }
  }

  async update({
    data,
    updatedById,
    lessonId,
    roleId
  }: {
    data: UpdateLessonBodyType
    updatedById: number
    lessonId: number
    roleId: number
  }) {
    try {
      const { duration, ...body } = data
      const lesson = await this.lessonRepo.update({
        data: {
          ...body,
          duration: body.type === LessonType.QUIZ ? 0 : duration
        },
        updatedById,
        lessonId,
        roleId
      })
      return lesson
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new NotAcceptableException('Chapter không tồn tại')
      }
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Bài học không tồn tại')
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw new NotAcceptableException('Bài học đã tồn tại')
      }
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi cập nhật bài học')
    }
  }

  async delete({ lessonId, deletedById, roleId }: { lessonId: number; deletedById: number; roleId: number }) {
    try {
      await this.lessonRepo.delete({ lessonId, deletedById, roleId })
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Bài học không tồn tại')
      }
      throw new BadRequestException('Lỗi khi xóa bài học')
    }
  }
}
