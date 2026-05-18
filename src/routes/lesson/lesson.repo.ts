import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateLessonBodyType,
  CreateLessonResType,
  GetLessonDetailResType,
  LessonType,
  UpdateLessonBodyType,
  UpdateLessonResType
} from 'src/routes/lesson/lesson.model'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class LessonRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedRoleRepo: SharedRoleRepository
  ) {}

  private async checkForAdmin(roleId: number) {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return roleId === adminRoleId
  }

  async hasCompletedAllPreviousLessons({ lessonId, userId }: { lessonId: number; userId: number }) {
    const currentLesson = await this.prismaService.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
        isDraft: false,
        chapter: {
          deletedAt: null,
          isDraft: false,
          course: {
            deletedAt: null,
            isDraft: false
          }
        }
      },
      select: {
        id: true,
        order: true,
        chapterId: true,
        chapter: {
          select: {
            order: true,
            courseId: true
          }
        }
      }
    })

    if (!currentLesson) return false

    const courseId = currentLesson.chapter.courseId

    const previousLessons = await this.prismaService.lesson.findMany({
      where: {
        deletedAt: null,
        isDraft: false,
        chapter: {
          courseId
        },
        OR: [
          {
            chapter: {
              order: {
                lt: currentLesson.chapter.order
              }
            }
          },
          {
            chapterId: currentLesson.chapterId,
            order: {
              lt: currentLesson.order
            }
          }
        ]
      },
      select: {
        id: true
      }
    })

    if (previousLessons.length === 0) return true

    const previousLessonIds = previousLessons.map((l) => l.id)

    const incompleteCount = await this.prismaService.lesson.count({
      where: {
        id: {
          in: previousLessonIds
        },
        lessonProgresses: {
          none: {
            userId
          }
        }
      }
    })

    return incompleteCount === 0
  }

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

  async getDetailAdmin({
    lessonId,
    roleId,
    userId
  }: {
    lessonId: number
    roleId: number
    userId: number
  }): Promise<GetLessonDetailResType | null> {
    const isAdmin = await this.checkForAdmin(roleId)
    return this.prismaService.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
        chapter: {
          deletedAt: null,
          course: {
            deletedAt: null,
            createdById: isAdmin ? undefined : userId
          }
        }
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
    const chapter = await this.prismaService.chapter.findUnique({
      where: {
        id: data.chapterId,
        deletedAt: null,
        course: {
          deletedAt: null
        }
      }
    })
    if (!chapter) {
      throw new NotFoundException('Không tìm thấy chương')
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

  async update({
    data,
    updatedById,
    lessonId,
    roleId
  }: {
    data: UpdateLessonBodyType & { key?: string }
    updatedById: number
    lessonId: number
    roleId: number
  }): Promise<UpdateLessonResType> {
    const isAdmin = await this.checkForAdmin(roleId)
    if (data.videoUrl) {
      const key = data.videoUrl.split('/').pop()?.split('.')[0]
      if (!key) {
        throw new BadRequestException('Video URL không hợp lệ')
      }
      data.key = key
    }
    const lesson = await this.prismaService.lesson.findUnique({
      where: {
        id: lessonId,
        deletedAt: null,
        chapter: {
          deletedAt: null,
          course: {
            deletedAt: null,
            createdById: isAdmin ? undefined : updatedById,
            chapters: {
              some: {
                id: data.chapterId
              }
            }
          }
        }
      }
    })
    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học')
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
    { lessonId, deletedById, roleId }: { lessonId: number; deletedById: number; roleId: number },
    isHard?: boolean
  ): Promise<LessonType | null> {
    const isAdmin = await this.checkForAdmin(roleId)
    if (isHard) {
      return this.prismaService.lesson.delete({
        where: {
          id: lessonId,
          chapter: {
            course: {
              createdById: isAdmin ? undefined : deletedById
            }
          }
        }
      })
    } else {
      return this.prismaService.lesson.update({
        where: {
          id: lessonId,
          deletedAt: null,
          chapter: {
            deletedAt: null,
            course: {
              deletedAt: null,
              createdById: isAdmin ? undefined : deletedById
            }
          }
        },
        data: {
          deletedAt: new Date(),
          deletedById
        }
      })
    }
  }

  async completeLesson({ lessonId, userId }: { lessonId: number; userId: number }) {
    const lesson = await this.prismaService.lesson.findUnique({
      where: {
        id: lessonId,
        deletedAt: null,
        chapter: {
          deletedAt: null,
          course: {
            deletedAt: null
          }
        }
      }
    })
    if (!lesson) {
      throw new NotFoundException('Bài học không tồn tại')
    }
    await this.prismaService.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      create: {
        userId,
        lessonId,
        createdAt: new Date()
      },
      update: {}
    })
  }
}
