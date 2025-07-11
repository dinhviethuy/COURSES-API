import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CourseType } from 'src/shared/constants/course.constant'
import { OrderBy, SortBy } from 'src/shared/constants/orther.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateCourseBodyType,
  CreateCourseResType,
  GetCourseDetailResType,
  GetCoursesQueryType,
  GetManageCoursesQueryType,
  ListCoursesResType,
  UpdateCourseBodyType,
  UpdateCourseResType
} from './course.model'

@Injectable()
export class CourseRepo {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * API dành cho client
   * Lấy chi tiết khóa học
   * @param courseId
   * @returns
   */
  async getCourseDetail(courseId: number): Promise<GetCourseDetailResType> {
    const course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
        deletedAt: null,
        isDraft: false
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
            deletedAt: null,
            isDraft: false
          }
        },
        chapters: {
          where: {
            deletedAt: null,
            isDraft: false
          },
          include: {
            lessons: {
              where: {
                deletedAt: null,
                isDraft: false
              },
              orderBy: {
                order: OrderBy.Asc
              }
            }
          },
          orderBy: {
            order: OrderBy.Asc
          }
        }
      }
    })
    if (!course) {
      throw new NotFoundException('Course not found')
    }
    return course
  }

  private generateFilter(query: GetCoursesQueryType | GetManageCoursesQueryType, isAdmin: boolean) {
    const { page, limit, search, minPrice, maxPrice, orderBy, sortBy } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      isDraft: isAdmin ? (query as GetManageCoursesQueryType)?.isDraft : false
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
    if (isAdmin) {
      where.createdById = (query as GetManageCoursesQueryType)?.createdById
    }
    let caculatedOrderBy: Prisma.CourseOrderByWithRelationInput | Prisma.CourseOrderByWithRelationInput[] = {
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

  async listCourses(query: GetCoursesQueryType): Promise<ListCoursesResType> {
    const { where, skip, take, orderBy, limit, page } = this.generateFilter(query, false)
    const [courses, totalItems] = await Promise.all([
      this.prismaService.course.findMany({
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

  async listCoursesForAdmin(query: GetManageCoursesQueryType): Promise<ListCoursesResType> {
    const { where, skip, take, orderBy, limit, page } = this.generateFilter(query, true)
    const [courses, totalItems] = await Promise.all([
      this.prismaService.course.findMany({
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

  /**
   * API dành cho admin
   * Lấy chi tiết khóa học
   * @param courseId
   * @returns
   */
  async getDetailForAdmin(courseId: number): Promise<GetCourseDetailResType> {
    const course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
        deletedAt: null
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
        }
      }
    })
    if (!course) {
      throw new NotFoundException('Course not found')
    }
    return course
  }

  async createCourse({
    data,
    createdById
  }: {
    data: CreateCourseBodyType
    createdById: number
  }): Promise<CreateCourseResType> {
    let course: CreateCourseResType
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
      }
      course = await this.prismaService.course.create({
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
      course = await this.prismaService.course.create({
        data: {
          ...data,
          createdById
        }
      })
    }
    return course
  }

  async updateCourse({
    courseId,
    data,
    updatedById
  }: {
    courseId: number
    data: UpdateCourseBodyType
    updatedById: number
  }): Promise<UpdateCourseResType> {
    const { courseIds, ...rest } = data
    const course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
        deletedAt: null
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
      throw new NotFoundException('Course not found')
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
      deletedById
    }: {
      courseId: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<void> {
    if (isHard) {
      await this.prismaService.course.delete({
        where: { id: courseId }
      })
    } else {
      await this.prismaService.course.update({
        where: {
          id: courseId,
          deletedAt: null
        },
        data: {
          deletedAt: new Date(),
          deletedById
        }
      })
    }
  }

  async reorderChaptersAndLessons({
    courseId,
    chapters,
    updatedById
  }: {
    courseId: number
    chapters: { id: number; order: number; lessons: { id: number; order: number }[] }[]
    updatedById: number
  }) {
    const updates: Prisma.PrismaPromise<any>[] = []
    // lấy danh sách chương và bài học từ db
    const chaptersInDb = await this.prismaService.chapter.findMany({
      where: {
        courseId,
        deletedAt: null
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
}
