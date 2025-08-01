import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CourseEnrollmentType,
  CreateCourseEnrollmentBodyType,
  CreateCourseEnrollmentResType,
  GetCourseEnrollmentDetailResType,
  GetCourseEnrollmentListResType,
  GetCourseEnrollmentQueryType,
  UpdateCourseEnrollmentBodyType,
  UpdateCourseEnrollmentResType
} from 'src/routes/student/student.model'
import { SortBy } from 'src/shared/constants/other.constant'
import { UserStatus } from 'src/shared/constants/user.constant'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class StudentRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedRoleRepo: SharedRoleRepository
  ) {}

  private async checkForAdmin(roleId?: number) {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return roleId === adminRoleId
  }

  private async generateWhere({
    query,
    roleId,
    userId
  }: {
    roleId: number
    query: GetCourseEnrollmentQueryType
    userId: number
  }) {
    const isAdmin = await this.checkForAdmin(roleId)

    const {
      fullName,
      email,
      titleCourse,
      getAll,
      limit,
      orderBy,
      page,
      sortBy,
      status,
      courseId,
      userId: userIdQuery
    } = query
    const skip = limit * (page - 1)
    const take = limit
    const where: Prisma.CourseEnrollmentWhereInput = {
      deletedAt: null,
      course: {
        createdById: isAdmin ? undefined : userId
      },
      status: status ? status : undefined
    }
    if (courseId) {
      where.courseId = courseId
    }
    if (userIdQuery) {
      where.userId = userIdQuery
    }
    if (fullName) {
      where.user = {
        fullName: {
          contains: fullName,
          mode: 'insensitive'
        }
      }
    }
    if (email) {
      where.user = {
        email: {
          contains: email,
          mode: 'insensitive'
        }
      }
    }

    if (titleCourse) {
      where.course = {
        title: {
          contains: titleCourse,
          mode: 'insensitive'
        }
      }
    }

    let caculatedOrderBy: Prisma.CourseEnrollmentOrderByWithRelationInput = {
      createdAt: orderBy
    }
    if (sortBy === SortBy.FullName) {
      caculatedOrderBy = {
        user: {
          fullName: orderBy
        }
      }
    }
    if (sortBy === SortBy.Email) {
      caculatedOrderBy = {
        user: {
          email: orderBy
        }
      }
    }
    if (sortBy === SortBy.Price) {
      caculatedOrderBy = {
        course: {
          price: orderBy
        }
      }
    }
    if (sortBy === SortBy.Sale) {
      caculatedOrderBy = {
        course: {
          discount: orderBy
        }
      }
    }

    return {
      skip,
      take,
      where,
      orderBy: caculatedOrderBy,
      getAll
    }
  }

  async listStudents({
    query,
    userId,
    roleId
  }: {
    query: GetCourseEnrollmentQueryType
    userId: number
    roleId: number
  }): Promise<GetCourseEnrollmentListResType> {
    const { skip, take, where, orderBy, getAll } = await this.generateWhere({ query, roleId, userId })
    const [totalItems, courseEnrollments] = await Promise.all([
      this.prismaService.courseEnrollment.count({ where }),
      this.prismaService.courseEnrollment.findMany({
        where,
        orderBy,
        ...(!getAll && {
          skip,
          take
        }),
        include: {
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              discount: true,
              image: true,
              createdBy: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      })
    ])
    return {
      courseEnrollments,
      page: query.page,
      limit: getAll ? totalItems : take,
      totalItems,
      totalPages: getAll ? 1 : Math.ceil(totalItems / take)
    }
  }

  async getStudentDetail({
    courseEnrollmentId,
    userId,
    roleId
  }: {
    courseEnrollmentId: number
    userId: number
    roleId: number
  }): Promise<GetCourseEnrollmentDetailResType | null> {
    const isAdmin = await this.checkForAdmin(roleId)
    return this.prismaService.courseEnrollment.findUnique({
      where: {
        id: courseEnrollmentId,
        deletedAt: null,
        course: {
          createdById: isAdmin ? undefined : userId
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            discount: true,
            image: true,
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })
  }

  private async checkCourseAndUserExist({
    courseId,
    createdById,
    roleId
  }: {
    courseId: number
    createdById: number
    roleId: number
  }) {
    const isAdmin = await this.checkForAdmin(roleId)
    const course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
        deletedAt: null,
        createdById: isAdmin ? undefined : createdById
      }
    })
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại')
    }
  }

  async createCourseEnrollment({
    data,
    createdById,
    roleId
  }: {
    createdById: number
    roleId: number
    data: CreateCourseEnrollmentBodyType
  }): Promise<CreateCourseEnrollmentResType> {
    await this.checkCourseAndUserExist({
      courseId: data.courseId,
      createdById,
      roleId
    })
    const [courseEnrollmentInDb, usersInDb] = await Promise.all([
      this.prismaService.courseEnrollment.findMany({
        where: {
          courseId: data.courseId,
          deletedAt: null,
          user: {
            deletedAt: null,
            status: UserStatus.ACTIVE
          }
        },
        select: {
          id: true,
          courseId: true,
          userId: true
        }
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
          status: UserStatus.ACTIVE,
          id: {
            in: data.userIds
          }
        }
      })
    ])
    const userSetInDb = new Set(usersInDb.map((u) => u.id))
    const enrolledSet = new Set(courseEnrollmentInDb.map((e) => e.userId))

    const userAddIds = data.userIds.filter((id) => userSetInDb.has(id) && !enrolledSet.has(id))
    const userDelete = courseEnrollmentInDb
      .filter((item) => !data.userIds.includes(item.userId))
      .map((item) => ({
        id: item.id,
        courseId: item.courseId,
        userId: item.userId
      }))
    const courseEnrollments = await this.prismaService.$transaction(async (tx) => {
      const res: GetCourseEnrollmentDetailResType[] = []
      for (const userId of userAddIds) {
        const courseEnrollment = await tx.courseEnrollment.create({
          data: {
            course: {
              connect: {
                id: data.courseId
              }
            },
            user: {
              connect: {
                id: userId
              }
            },
            createdBy: {
              connect: {
                id: createdById
              }
            }
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                price: true,
                discount: true,
                image: true,
                createdBy: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        })
        res.push(courseEnrollment)
      }
      const deletedAt = new Date()
      for (const item of userDelete) {
        await tx.courseEnrollment.update({
          where: {
            ...item,
            deletedAt: null
          },
          data: {
            deletedAt,
            deletedById: createdById
          }
        })
      }
      return res
    })
    return {
      courseEnrollments
    }
  }

  async updateCourseEnrollment({
    courseEnrollmentId,
    data,
    updatedById,
    roleId
  }: {
    courseEnrollmentId: number
    data: UpdateCourseEnrollmentBodyType
    updatedById: number
    roleId: number
  }): Promise<UpdateCourseEnrollmentResType> {
    const isAdmin = await this.checkForAdmin(roleId)
    const [courseEnrollment] = await Promise.all([
      this.prismaService.courseEnrollment.findUnique({
        where: {
          id: courseEnrollmentId,
          deletedAt: null,
          course: {
            createdById: isAdmin ? undefined : updatedById
          }
        }
      }),
      this.checkCourseAndUserExist({
        courseId: data.courseId,
        createdById: updatedById,
        roleId
      })
    ])
    if (!courseEnrollment) {
      throw new NotFoundException('Học viên không tồn tại')
    }
    return this.prismaService.courseEnrollment.update({
      where: {
        id: courseEnrollmentId,
        deletedAt: null
      },
      data: {
        status: data.status,
        userId: data.userId,
        courseId: data.courseId,
        updatedById
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            discount: true,
            image: true,
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })
  }

  async deleteCourseEnrollment(
    {
      courseEnrollmentId,
      deletedById,
      roleId
    }: {
      courseEnrollmentId: number
      deletedById: number
      roleId: number
    },
    isHard?: boolean
  ): Promise<CourseEnrollmentType> {
    const isAdmin = await this.checkForAdmin(roleId)
    if (isHard) {
      return this.prismaService.courseEnrollment.delete({
        where: {
          id: courseEnrollmentId,
          deletedAt: null,
          course: {
            createdById: isAdmin ? undefined : deletedById
          }
        }
      })
    }
    return this.prismaService.courseEnrollment.update({
      where: {
        id: courseEnrollmentId,
        deletedAt: null,
        course: {
          createdById: isAdmin ? undefined : deletedById
        }
      },
      data: {
        deletedAt: new Date(),
        deletedById
      }
    })
  }
}
