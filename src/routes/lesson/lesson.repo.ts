import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateLessonBodyType,
  CreateLessonResType,
  GetLessonDetailResType,
  LessonType,
  UpdateLessonBodyType,
  UpdateLessonResType
} from './lesson.model'

@Injectable()
export class LessonRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async getDetailClient(lessonId: number): Promise<GetLessonDetailResType | null> {
    const lesson = await this.prismaService.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
        isDraft: false,
        chapter: {
          isDraft: false,
          deletedAt: null,
          course: {
            deletedAt: null,
            isDraft: false
          }
        }
      },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!lesson) {
      return null
    }

    return lesson
  }

  async getDetailAdmin(lessonId: number): Promise<GetLessonDetailResType | null> {
    return this.prismaService.lesson.findUnique({
      where: {
        id: lessonId,
        deletedAt: null
      }
    })
  }

  async create(data: CreateLessonBodyType & { key?: string }, createdById: number): Promise<CreateLessonResType> {
    if (data.videoUrl) {
      const key = data.videoUrl.split('/').pop()?.split('.')[0]
      if (!key) {
        throw new BadRequestException('Video URL không hợp lệ')
      }
      data.key = key
    }
    const count = await this.prismaService.lesson.count({
      where: {
        chapterId: data.chapterId,
        deletedAt: null
      }
    })
    return this.prismaService.lesson.create({
      data: {
        ...data,
        order: count,
        createdById
      }
    })
  }

  update({
    data,
    updatedById,
    lessonId
  }: {
    data: UpdateLessonBodyType & { key?: string }
    updatedById: number
    lessonId: number
  }): Promise<UpdateLessonResType> {
    if (data.videoUrl) {
      const key = data.videoUrl.split('/').pop()?.split('.')[0]
      if (!key) {
        throw new BadRequestException('Video URL không hợp lệ')
      }
      data.key = key
    }
    return this.prismaService.lesson.update({
      where: {
        id: lessonId,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById
      }
    })
  }

  async delete(
    { lessonId, deletedById }: { lessonId: number; deletedById: number },
    isHard?: boolean
  ): Promise<LessonType | null> {
    if (isHard) {
      return this.prismaService.lesson.delete({
        where: {
          id: lessonId
        }
      })
    } else {
      return this.prismaService.lesson.update({
        where: {
          id: lessonId,
          deletedAt: null
        },
        data: {
          deletedAt: new Date(),
          deletedById
        }
      })
    }
  }
}
