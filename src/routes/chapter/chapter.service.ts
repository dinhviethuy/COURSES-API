import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateChapterBodyType, UpdateChapterBodyType } from 'src/routes/chapter/chapter.model'
import { ChapterRepo } from 'src/routes/chapter/chapter.repo'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'

@Injectable()
export class ChapterService {
  constructor(private readonly chapterRepo: ChapterRepo) {}

  async createChapter(data: CreateChapterBodyType, createdById: number) {
    try {
      const chapter = await this.chapterRepo.createChapter(data, createdById)
      return chapter
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Thứ tự chương đã tồn tại trong khóa học')
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new BadRequestException('Khóa học không tồn tại')
      }
      throw error
    }
  }

  async updateChapter({
    chapterId,
    data,
    updatedById,
    roleId
  }: {
    chapterId: number
    data: UpdateChapterBodyType
    updatedById: number
    roleId: number
  }) {
    try {
      const chapter = await this.chapterRepo.updateChapter({ chapterId, data, updatedById, roleId })
      return chapter
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Thứ tự chương đã tồn tại trong khóa học')
      }
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Chương hoặc khóa học không tồn tại')
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new BadRequestException('Khóa học không tồn tại')
      }
      if (error instanceof HttpException) {
        throw error
      }
      throw error
    }
  }

  async deleteChapter({ chapterId, deletedById, roleId }: { chapterId: number; deletedById: number; roleId: number }) {
    try {
      await this.chapterRepo.deleteChapter({ chapterId, deletedById, roleId })
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Chương không tồn tại')
      }
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi xóa chương')
    }
  }
}
