import { Injectable } from '@nestjs/common'
import { ChapterType } from 'src/shared/models/shared-chapter.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateChaperBodyType, CreateChaperResType, UpdateChaperBodyType, UpdateChaperResType } from './chapter.model'

@Injectable()
export class ChapterRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async createChapter(data: CreateChaperBodyType, createdById: number): Promise<CreateChaperResType> {
    const order = await this.prismaService.chapter.count({
      where: { courseId: data.courseId }
    })
    return this.prismaService.chapter.create({
      data: {
        ...data,
        createdById,
        order
      }
    })
  }

  updateChapter({
    chapterId,
    data,
    updatedById
  }: {
    chapterId: number
    data: UpdateChaperBodyType
    updatedById: number
  }): Promise<UpdateChaperResType> {
    return this.prismaService.chapter.update({
      where: { id: chapterId },
      data: {
        ...data,
        updatedById
      }
    })
  }

  deleteChapter(
    {
      chapterId,
      deletedById
    }: {
      chapterId: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<ChapterType> {
    if (isHard) {
      return this.prismaService.chapter.delete({
        where: { id: chapterId }
      })
    }
    return this.prismaService.chapter.update({
      where: { id: chapterId, deletedAt: null },
      data: {
        deletedById,
        deletedAt: new Date()
      }
    })
  }
}
