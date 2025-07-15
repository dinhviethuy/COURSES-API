import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CreateUserBodyType, GetUsersQueryType, GetUsersResType } from 'src/routes/user/user.model'
import { SortBy } from 'src/shared/constants/other.constant'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRepo {
  constructor(private prismaService: PrismaService) {}

  private generateFilter(query: GetUsersQueryType) {
    const { page, limit, search, status, roleId, orderBy, sortBy } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.UserWhereInput = {
      deletedAt: null
    }
    if (search) {
      where.fullName = {
        contains: search,
        mode: 'insensitive'
      }
    }
    if (status) {
      where.status = status
    }
    if (roleId) {
      where.roleId = roleId
    }
    let caculatedOrderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] = {
      createdAt: orderBy
    }
    if (sortBy === SortBy.FullName) {
      caculatedOrderBy = {
        fullName: orderBy
      }
    }
    if (sortBy === SortBy.Email) {
      caculatedOrderBy = {
        email: orderBy
      }
    }
    return {
      skip,
      take,
      where,
      orderBy: caculatedOrderBy
    }
  }

  async list(pagination: GetUsersQueryType): Promise<GetUsersResType> {
    const { skip, take, where, orderBy } = this.generateFilter(pagination)
    const [totalItems, users] = await Promise.all([
      this.prismaService.user.count({
        where
      }),
      this.prismaService.user.findMany({
        where,
        include: {
          role: true
        },
        ...(!pagination.getAll && { skip, take }),
        orderBy
      })
    ])
    return {
      totalItems,
      users,
      page: pagination.page,
      limit: pagination.getAll ? totalItems : pagination.limit,
      totalPages: pagination.getAll ? 1 : Math.ceil(totalItems / pagination.limit)
    }
  }

  async create({ createdById, data }: { createdById: number | null; data: CreateUserBodyType }): Promise<UserType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById
      }
    })
  }

  async delete(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number | null
    },
    isHard?: boolean
  ): Promise<UserType> {
    return isHard
      ? this.prismaService.user.delete({
          where: {
            id
          }
        })
      : this.prismaService.user.update({
          where: {
            id,
            deletedAt: null
          },
          data: {
            deletedAt: new Date(),
            deletedById
          }
        })
  }
}
