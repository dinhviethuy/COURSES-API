import { Injectable } from '@nestjs/common'
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
    const lesson = await this.prismaService.lesson.findUnique({
      where: {
        id: lessonId,
        deletedAt: null,
        isDraft: false
      },
      include: {
        chapter: {
          include: {
            course: true
          }
        }
      }
    })
    if (!lesson || lesson.chapter.isDraft || lesson.chapter.course.isDraft) {
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

  async create(data: CreateLessonBodyType, createdById: number): Promise<CreateLessonResType> {
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
    data: UpdateLessonBodyType
    updatedById: number
    lessonId: number
  }): Promise<UpdateLessonResType> {
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
