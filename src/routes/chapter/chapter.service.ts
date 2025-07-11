import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { CreateChaperBodyType, UpdateChaperBodyType } from './chapter.model'
import { ChapterRepo } from './chapter.repo'

@Injectable()
export class ChapterService {
  constructor(private readonly chapterRepo: ChapterRepo) {}

  async createChapter(data: CreateChaperBodyType, createdById: number) {
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
    updatedById
  }: {
    chapterId: number
    data: UpdateChaperBodyType
    updatedById: number
  }) {
    try {
      const chapter = await this.chapterRepo.updateChapter({ chapterId, data, updatedById })
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
      throw error
    }
  }

  async deleteChapter({ chapterId, deletedById }: { chapterId: number; deletedById: number }) {
    try {
      await this.chapterRepo.deleteChapter({ chapterId, deletedById })
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Chương không tồn tại')
      }
      throw new BadRequestException('Lỗi khi xóa chương')
    }
  }
}
