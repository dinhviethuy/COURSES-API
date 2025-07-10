import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  PermissionType,
  UpdatePermissionBodyType
} from './permission.model'

@Injectable()
export class PermissionRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, permissions] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.permission.findMany({
        skip,
        take,
        where: {
          deletedAt: null
        }
      })
    ])
    return {
      permissions,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit)
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
}
