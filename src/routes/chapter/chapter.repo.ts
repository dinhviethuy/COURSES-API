import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateChapterBodyType,
  CreateChapterResType,
  UpdateChapterBodyType,
  UpdateChapterResType
} from 'src/routes/chapter/chapter.model'
import { CourseType } from 'src/shared/constants/course.constant'
import { ChapterType } from 'src/shared/models/shared-chapter.model'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class ChapterRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedRoleRepo: SharedRoleRepository
  ) {}

  private async checkForAdmin(roleId: number) {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return roleId === adminRoleId
  }

  async createChapter(data: CreateChapterBodyType, createdById: number): Promise<CreateChapterResType> {
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
  }): Promise<UpdateChapterResType> {
    const isAdmin = await this.checkForAdmin(roleId)
    return this.prismaService.chapter.update({
      where: {
        id: chapterId,
        deletedAt: null,
        courseId: data.courseId,
        course: {
          deletedAt: null,
          createdById: isAdmin ? undefined : updatedById
        }
      },
      data: {
        title: data.title,
        description: data.description,
        isDraft: data.isDraft,
        updatedById
      }
    })
  }

  async deleteChapter(
    {
      chapterId,
      deletedById,
      roleId
    }: {
      chapterId: number
      deletedById: number
      roleId: number
    },
    isHard?: boolean
  ): Promise<ChapterType> {
    const isAdmin = await this.checkForAdmin(roleId)
    if (isHard) {
      return this.prismaService.chapter.delete({
        where: {
          id: chapterId,
          course: {
            createdById: isAdmin ? undefined : deletedById
          }
        }
      })
    }
    return this.prismaService.$transaction(async (tx) => {
      const deletedAt = new Date()
      const chapter = await tx.chapter.update({
        where: {
          id: chapterId,
          deletedAt: null,
          course: {
            deletedAt: null,
            createdById: isAdmin ? undefined : deletedById
          }
        },
        data: {
          deletedById,
          deletedAt
        }
      })
      await tx.lesson.updateMany({
        where: {
          chapterId,
          deletedAt: null
        },
        data: {
          deletedById,
          deletedAt
        }
      })
      return chapter
    })
  }
}
