import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CreatePermissionBodyType,
  GetModulesResType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  UpdatePermissionBodyType
} from 'src/routes/permission/permission.model'
import { SortBy } from 'src/shared/constants/other.constant'
import { PermissionType } from 'src/shared/models/shared-permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PermissionRepo {
  constructor(private readonly prismaService: PrismaService) {}

  private generateWhereClause(pagination: GetPermissionsQueryType) {
    const where: Prisma.PermissionWhereInput = {
      deletedAt: null
    }
    if (pagination.module) {
      where.module = {
        contains: pagination.module,
        mode: 'insensitive'
      }
    }
    if (pagination.method) {
      where.method = {
        equals: pagination.method
      }
    }
    if (pagination.path) {
      where.path = {
        contains: pagination.path,
        mode: 'insensitive'
      }
    }
    if (pagination.name) {
      where.name = {
        contains: pagination.name,
        mode: 'insensitive'
      }
    }
    let caculatedOrderBy: Prisma.PermissionOrderByWithRelationInput | Prisma.PermissionOrderByWithRelationInput[] = {
      createdAt: pagination.orderBy
    }
    if (pagination.sortBy === SortBy.Name) {
      caculatedOrderBy = {
        name: pagination.orderBy
      }
    }
    return {
      where,
      skip: pagination.limit * (pagination.page - 1),
      take: pagination.getAll ? undefined : pagination.limit,
      orderBy: caculatedOrderBy
    }
  }

  async list(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType> {
    const { where, skip, take, orderBy } = this.generateWhereClause(pagination)
    const [totalItems, permissions] = await Promise.all([
      this.prismaService.permission.count({
        where
      }),
      this.prismaService.permission.findMany({
        ...(!pagination.getAll && {
          skip,
          take
        }),
        where,
        orderBy
      })
    ])
    return {
      permissions,
      totalItems,
      page: pagination.page,
      limit: pagination.getAll ? totalItems : pagination.limit,
      totalPages: pagination.getAll ? 1 : Math.ceil(totalItems / pagination.limit)
    }
  }

  async findById(id: number) {
    return this.prismaService.permission.findFirst({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  async create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreatePermissionBodyType
  }): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById
      }
    })
  }

  async update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdatePermissionBodyType
  }): Promise<PermissionType & { roles: { id: number }[] }> {
    return this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById
      },
      include: {
        roles: true
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
  ): Promise<PermissionType & { roles: { id: number }[] }> {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id
          },
          include: {
            roles: true
          }
        })
      : this.prismaService.permission.update({
          where: {
            id,
            deletedAt: null
          },
          data: {
            deletedById,
            deletedAt: new Date()
          },
          include: {
            roles: true
          }
        })
  }

  async getModules(): Promise<GetModulesResType> {
    const modules = await this.prismaService.permission.findMany({
      where: {
        deletedAt: null
      },
      select: {
        module: true
      },
      distinct: ['module']
    })
    return {
      modules
    }
  }
}
