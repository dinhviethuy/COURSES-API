import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CanAccessCourseBodyType,
  CreateCourseBodyType,
  CreateCourseResType,
  GetCourseDetailResType,
  GetCourseDetailResTypeForAdmin,
  GetCoursesQueryType,
  GetManageCoursesQueryType,
  ListCoursesResType,
  UpdateCourseBodyType,
  UpdateCourseResType,
  ValidateSlugBodyType
} from 'src/routes/course/course.model'
import { CourseEnrollmentStatus } from 'src/shared/constants/course-enrollment.constant'
import { CourseType } from 'src/shared/constants/course.constant'
import { OrderBy, SortBy } from 'src/shared/constants/other.constant'
import { CourseType as CourseTypeModel } from 'src/shared/models/shrared-course.model'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CourseRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedRoleRepo: SharedRoleRepository
  ) {}

  private async checkForAdmin(roleId: number) {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return roleId === adminRoleId
  }

  private getDetail(where: { id: number } | { slug: string }) {
    return this.prismaService.course.findFirst({
      where: {
        ...where,
        deletedAt: null,
        isDraft: false
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        courseType: true,
        price: true,
        isDraft: true,
        discount: true,
        image: true,
        video: true,
        benefits: true,
        updatedAt: true,
        comboChildren: {
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            courseType: true
          },
          where: {
            deletedAt: null,
            isDraft: false
          },
          orderBy: {
            createdAt: OrderBy.Desc
          }
        },
        chapters: {
          select: {
            id: true,
            title: true,
            order: true,
            description: true,
            lessons: {
              select: {
                id: true,
                title: true,
                order: true,
                duration: true
              },
              where: {
                deletedAt: null,
                isDraft: false
              },
              orderBy: {
                order: OrderBy.Asc
              }
            }
          },
          where: {
            deletedAt: null,
            isDraft: false
          },
          orderBy: {
            order: OrderBy.Asc
          }
        },
        createdBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })
  }

  /**
   * API dành cho client
   * Lấy chi tiết khóa học
   */
  async getCourseDetail(where: { id: number } | { slug: string }): Promise<GetCourseDetailResType | null> {
    const course = await this.getDetail(where)
    if (!course) {
      return null
    }
    const chaptersWithDuration = course.chapters.map((chapter) => {
      const duration = chapter.lessons.reduce((acc, lesson) => acc + lesson.duration, 0)
      return {
        ...chapter,
        duration
      }
    })
    const totalDuration = chaptersWithDuration.reduce((acc, chapter) => acc + chapter.duration, 0)
    return {
      ...course,
      chapters: chaptersWithDuration,
      duration: totalDuration
    }
  }

  private async generateFilter({
    query,
    isAdmin,
    roleId,
    userId,
    isBought
  }: {
    query: GetCoursesQueryType | GetManageCoursesQueryType
    isAdmin: boolean
    roleId?: number
    userId?: number
    isBought?: boolean
  }) {
    const { page, limit, search, minPrice, maxPrice, orderBy, sortBy } = query
    const skip = (page - 1) * limit
    const take = limit
    const isAdminOrCreator = roleId ? await this.checkForAdmin(roleId) : true
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      isDraft: isAdmin ? (query as GetManageCoursesQueryType)?.isDraft : false,
      createdById: isAdminOrCreator ? undefined : userId
    }
    if (isBought) {
      where.courseEnrollments = {
        some: {
          userId
        }
      }
    }
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      }
    }
    if (minPrice) {
      where.price = {
        gte: minPrice
      }
    }
    if (maxPrice) {
      where.price = {
        lte: maxPrice
      }
    }
    if (isAdmin && isAdminOrCreator) {
      where.createdById = (query as GetManageCoursesQueryType)?.createdById
    }
    let caculatedOrderBy: Prisma.CourseOrderByWithRelationInput | Prisma.CourseOrderByWithRelationInput[] = isBought
      ? {}
      : {
          createdAt: orderBy
        }
    if (sortBy === SortBy.Price) {
      caculatedOrderBy = {
        price: orderBy
      }
    }
    if (sortBy === SortBy.Sale) {
      caculatedOrderBy = {
        discount: orderBy
      }
    }
    return {
      where,
      skip,
      take,
      orderBy: caculatedOrderBy,
      limit: query.limit,
      page: query.page
    }
  }

  private buildWhereClause(where: Prisma.CourseWhereInput): string {
    const conditions: string[] = []

    if (where.deletedAt === null) {
      conditions.push(`"Course"."deletedAt" IS NULL`)
    }

    if (typeof where.isDraft === 'boolean') {
      conditions.push(`"Course"."isDraft" = ${where.isDraft}`)
    }

    if (typeof where.createdById === 'number') {
      conditions.push(`"Course"."createdById" = ${where.createdById}`)
    }

    if (typeof where.title === 'object' && where.title && 'contains' in where.title) {
      const keyword = (where.title as Prisma.StringFilter).contains
      if (typeof keyword === 'string') {
        conditions.push(`LOWER("Course"."title") LIKE LOWER('%${keyword.replace(/'/g, "''")}%')`)
      }
    }

    if (typeof where.price === 'object' && where.price) {
      const price = where.price as Prisma.IntFilter
      if (typeof price.gte === 'number') {
        conditions.push(`"Course"."price" >= ${price.gte}`)
      }
      if (typeof price.lte === 'number') {
        conditions.push(`"Course"."price" <= ${price.lte}`)
      }
    }

    return conditions.length > 0 ? conditions.join(' AND ') : 'TRUE'
  }

  async listCourses({
    query,
    userId,
    isBought
  }: {
    query: GetCoursesQueryType
    isBought?: boolean
    userId?: number
  }): Promise<ListCoursesResType> {
    const { where, skip, take, orderBy, limit, page } = await this.generateFilter({
      query,
      isAdmin: false,
      isBought,
      userId
    })
    const whereClause = this.buildWhereClause(where)
    const [courses, totalItems] = await Promise.all([
      isBought
        ? this.prismaService.$queryRawUnsafe<CourseTypeModel[]>(
            `
            SELECT "Course".*
            FROM "Course"
            INNER JOIN "CourseEnrollment"
              ON "Course"."id" = "CourseEnrollment"."courseId"
              AND "CourseEnrollment"."userId" = $1
            WHERE ${whereClause}
            ${query.sortBy === SortBy.CreatedAt ? `ORDER BY "CourseEnrollment"."createdAt" ${query.orderBy}` : `ORDER BY "Course"."${query.sortBy}" ${query.orderBy}`}
            LIMIT $2
            OFFSET $3
            `,
            userId,
            take,
            skip
          )
        : this.prismaService.course.findMany({
            where,
            skip,
            take,
            orderBy
          }),
      this.prismaService.course.count({
        where
      })
    ])
    return {
      courses,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  }

  async listCoursesForAdmin({
    query,
    roleId,
    userId
  }: {
    query: GetManageCoursesQueryType
    roleId: number
    userId: number
  }): Promise<ListCoursesResType> {
    const { where, skip, take, orderBy, limit, page } = await this.generateFilter({
      query,
      isAdmin: true,
      roleId,
      userId
    })
    const [courses, totalItems] = await Promise.all([
      this.prismaService.course.findMany({
        where,
        ...(!query.getAll && {
          skip,
          take
        }),
        orderBy
      }),
      this.prismaService.course.count({
        where
      })
    ])
    return {
      courses,
      page,
      limit: query.getAll ? totalItems : limit,
      totalItems,
      totalPages: query.getAll ? 1 : Math.ceil(totalItems / limit)
    }
  }

  /**
   * API dành cho admin
   * Lấy chi tiết khóa học
   */
  async getDetailForAdmin({
    courseId,
    roleId,
    userId
  }: {
    courseId: number
    roleId: number
    userId: number
  }): Promise<GetCourseDetailResTypeForAdmin | null> {
    const isAdminOrCreator = await this.checkForAdmin(roleId)
    const course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
        deletedAt: null,
        createdById: isAdminOrCreator ? undefined : userId
      },
      include: {
        comboChildren: {
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            courseType: true
          },
          where: {
            deletedAt: null
          },
          orderBy: {
            createdAt: OrderBy.Desc
          }
        },
        chapters: {
          where: {
            deletedAt: null
          },
          include: {
            lessons: {
              where: {
                deletedAt: null
              },
              orderBy: {
                order: OrderBy.Asc
              }
            }
          },
          orderBy: {
            order: OrderBy.Asc
          }
        },
        createdBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })
    if (!course) {
      return null
    }
    const chaptersWithDuration = course.chapters.map((chapter) => {
      const duration = chapter.lessons.reduce((acc, lesson) => acc + lesson.duration, 0)
      return {
        ...chapter,
        duration
      }
    })
    const totalDuration = chaptersWithDuration.reduce((acc, chapter) => acc + chapter.duration, 0)
    return {
      ...course,
      chapters: chaptersWithDuration,
      duration: totalDuration
    }
  }

  async createCourse({
    data,
    createdById
  }: {
    data: CreateCourseBodyType
    createdById: number
  }): Promise<CreateCourseResType> {
    if (data.courseType === CourseType.COMBO) {
      const listCourse = await this.prismaService.course.findMany({
        where: {
          id: {
            in: data.courseIds
          },
          deletedAt: null
        },
        select: {
          id: true,
          courseType: true,
          comboChildren: {
            select: {
              id: true,
              title: true,
              courseType: true
            }
          }
        }
      })

      if (listCourse.length !== data.courseIds?.length) {
        throw new BadRequestException('Khóa học con không tồn tại')
      }
      const setIds = new Set<number>()
      for (const course of listCourse) {
        if (course.courseType === CourseType.COMBO) {
          course.comboChildren.forEach((child) => setIds.add(child.id))
        } else {
          setIds.add(course.id)
        }
        setIds.add(course.id)
      }
      return this.prismaService.course.create({
        data: {
          title: data.title,
          description: data.description,
          slug: data.slug,
          price: data.price,
          isDraft: data.isDraft,
          discount: data.discount,
          image: data.image,
          video: data.video,
          courseType: CourseType.COMBO,
          createdById,
          comboChildren: {
            connect: Array.from(setIds).map((id) => ({ id }))
          }
        }
      })
    } else {
      return this.prismaService.course.create({
        data: {
          ...data,
          createdById
        }
      })
    }
  }

  async updateCourse({
    courseId,
    data,
    updatedById,
    roleId
  }: {
    courseId: number
    data: UpdateCourseBodyType
    updatedById: number
    roleId: number
  }): Promise<UpdateCourseResType> {
    const { courseIds, ...rest } = data
    const isAdminOrCreator = await this.checkForAdmin(roleId)
    const course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
        deletedAt: null,
        createdById: isAdminOrCreator ? undefined : updatedById
      },
      select: {
        courseType: true,
        comboChildren: {
          select: {
            id: true
          },
          where: {
            deletedAt: null
          }
        }
      }
    })
    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học')
    }
    if (course.courseType !== data.courseType) {
      throw new BadRequestException('Không thể chuyển đổi loại khóa học')
    }
    if (data.courseType === CourseType.COMBO) {
      const childrenCourseIdsInDb = course.comboChildren.map((child) => child.id)
      const childrenCourseIdsToBody = await this.prismaService.course.findMany({
        where: {
          id: {
            in: courseIds
          },
          deletedAt: null
        },
        select: {
          id: true,
          courseType: true,
          comboChildren: {
            select: {
              id: true
            },
            where: {
              deletedAt: null
            }
          }
        }
      })
      if (childrenCourseIdsToBody.length !== courseIds?.length) {
        throw new BadRequestException('Khóa học con không tồn tại')
      }
      const setIds = new Set<number>()
      for (const course of childrenCourseIdsToBody) {
        if (course.courseType === CourseType.COMBO) {
          course.comboChildren.forEach((child) => setIds.add(child.id))
        } else {
          setIds.add(course.id)
        }
      }
      const arrayIdsToDisconnect = childrenCourseIdsInDb.filter((id) => !setIds.has(id))
      const arrayIdsToConnect = Array.from(setIds).filter((id) => !childrenCourseIdsInDb.includes(id))
      return this.prismaService.course.update({
        where: {
          id: courseId,
          deletedAt: null
        },
        data: {
          ...rest,
          comboChildren: {
            disconnect: arrayIdsToDisconnect.map((id) => ({ id })),
            connect: arrayIdsToConnect.map((id) => ({ id }))
          },
          updatedById
        }
      })
    } else {
      return this.prismaService.course.update({
        where: {
          id: courseId,
          deletedAt: null
        },
        data: {
          ...rest,
          updatedById
        }
      })
    }
  }

  async deleteCourse(
    {
      courseId,
      deletedById,
      roleId
    }: {
      courseId: number
      deletedById: number
      roleId: number
    },
    isHard?: boolean
  ): Promise<CourseTypeModel | null> {
    const isAdminOrCreator = await this.checkForAdmin(roleId)
    if (isHard) {
      return this.prismaService.course.delete({
        where: {
          id: courseId,
          createdById: isAdminOrCreator ? undefined : deletedById
        }
      })
    } else {
      return this.prismaService.$transaction(async (tx) => {
        const deletedAt = new Date()
        const course = tx.course.update({
          where: {
            id: courseId,
            deletedAt: null,
            createdById: isAdminOrCreator ? undefined : deletedById
          },
          data: {
            deletedAt,
            deletedById
          }
        })
        // set deletedAt cho chương
        await tx.chapter.updateMany({
          where: {
            courseId,
            deletedAt: null
          },
          data: {
            deletedAt,
            deletedById
          }
        })
        // set deletedAt cho bài học
        await tx.lesson.updateMany({
          where: {
            chapter: {
              courseId,
              deletedAt
            },
            deletedAt: null
          },
          data: {
            deletedAt,
            deletedById
          }
        })
        return course
      })
    }
  }

  async reorderChaptersAndLessons({
    courseId,
    chapters,
    updatedById,
    roleId
  }: {
    courseId: number
    chapters: { id: number; order: number; lessons: { id: number; order: number }[] }[]
    updatedById: number
    roleId: number
  }) {
    const isAdminOrCreator = await this.checkForAdmin(roleId)
    const updates: Prisma.PrismaPromise<any>[] = []
    // lấy danh sách chương và bài học từ db
    const chaptersInDb = await this.prismaService.chapter.findMany({
      where: {
        courseId,
        deletedAt: null,
        course: {
          createdById: isAdminOrCreator ? undefined : updatedById,
          deletedAt: null
        }
      },
      select: {
        id: true,
        order: true,
        lessons: {
          select: {
            id: true,
            order: true
          },
          where: {
            deletedAt: null
          }
        }
      }
    })
    // lấy danh sách id của chương và bài học
    const chapterIds = chaptersInDb.map((chapter) => chapter.id)
    const lessonIds = chaptersInDb.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id))

    // kiểm tra xem chương có tồn tại không
    const chaptersNotExists = chapters.filter((chapter) => !chapterIds.includes(chapter.id))
    if (chaptersNotExists.length > 0) {
      throw new BadRequestException('Chương không tồn tại')
    }

    // kiểm tra xem bài học có tồn tại không
    const lessonsNotExists = chapters.flatMap((chapter) =>
      chapter.lessons.filter((lesson) => !lessonIds.includes(lesson.id))
    )

    // kiểm tra xem bài học có tồn tại không
    if (lessonsNotExists.length > 0) {
      throw new BadRequestException('Bài học không tồn tại')
    }

    // cập nhật thứ tự chương
    for (const chapter of chapters) {
      updates.push(
        this.prismaService.chapter.update({
          where: {
            id: chapter.id
          },
          data: {
            order: chapter.order,
            updatedById
          }
        })
      )

      // cập nhật thứ tự bài học trong chương
      for (const lesson of chapter.lessons) {
        updates.push(
          this.prismaService.lesson.update({
            where: {
              id: lesson.id
            },
            data: {
              chapterId: chapter.id,
              order: lesson.order,
              updatedById
            }
          })
        )
      }
    }

    await this.prismaService.$transaction(updates)
  }

  async validateSlug({ slug, courseId }: ValidateSlugBodyType): Promise<CourseTypeModel | null> {
    return this.prismaService.course.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(courseId && {
          id: {
            not: courseId
          }
        })
      }
    })
  }

  async canAccessCourse({
    where,
    userId,
    roleId
  }: {
    where: CanAccessCourseBodyType
    userId: number
    roleId: number
  }): Promise<boolean> {
    const whereClause = where.courseId ? { id: where.courseId } : { slug: where.slug }
    const [course, adminRoleId, teacherRoleId] = await Promise.all([
      this.prismaService.course.findFirst({
        where: {
          ...whereClause,
          deletedAt: null,
          isDraft: false,
          courseEnrollments: {
            some: {
              userId,
              status: CourseEnrollmentStatus.ACTIVE
            }
          }
        }
      }),
      this.sharedRoleRepo.getAdminRoleId(),
      this.sharedRoleRepo.getTeacherRoleId()
    ])
    if (!course && roleId !== adminRoleId && roleId !== teacherRoleId) {
      return false
    }
    return true
  }
}
