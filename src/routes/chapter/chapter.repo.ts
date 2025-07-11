import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CourseType } from 'src/shared/constants/course.constant'
import { ChapterType } from 'src/shared/models/shared-chapter.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateChaperBodyType, CreateChaperResType, UpdateChaperBodyType, UpdateChaperResType } from './chapter.model'

@Injectable()
export class ChapterRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async createChapter(data: CreateChaperBodyType, createdById: number): Promise<CreateChaperResType> {
    const course = await this.prismaService.course.findUnique({
      where: {
        id: data.courseId,
        deletedAt: null
      }
    })
    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học')
    }
    if (course.courseType === CourseType.COMBO) {
      throw new BadRequestException('Không thể tạo chương cho khóa học combo')
    }
    const order = await this.prismaService.chapter.count({
      where: {
        courseId: data.courseId,
        deletedAt: null
      }
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
      where: {
        id: chapterId,
        deletedAt: null,
        courseId: data.courseId
      },
      data: {
        title: data.title,
        description: data.description,
        isDraft: data.isDraft,
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
