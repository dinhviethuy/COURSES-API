import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { SortBy } from 'src/shared/constants/orther.constant'
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
              }
            }
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
        chapters: {
          where: {
            deletedAt: null
          },
          include: {
            lessons: {
              where: {
                deletedAt: null
              }
            }
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
    const course = await this.prismaService.course.create({
      data: {
        ...data,
        createdById
      }
    })
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
    const course = await this.prismaService.course.update({
      where: { id: courseId },
      data: {
        ...data,
        updatedById
      }
    })
    return course
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
}
