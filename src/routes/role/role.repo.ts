import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  GetRolesResType,
  RoleWithPermissionsType,
  UpdateRoleBodyType
} from 'src/routes/role/role.model'
import { SortBy } from 'src/shared/constants/other.constant'
import { RoleType } from 'src/shared/models/shared-role.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RoleRepo {
  constructor(private readonly prismaService: PrismaService) {}

  private generateFilter(pagination: GetRolesQueryType) {
    const { page, limit, orderBy, sortBy, isActive, getAll, search } = pagination
    const skip = limit * (page - 1)
    const take = limit
    const where: Prisma.RoleWhereInput = {
      deletedAt: null
    }
    if (isActive) {
      where.isActive = isActive
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    let caculatedOrderBy: Prisma.RoleOrderByWithRelationInput | Prisma.RoleOrderByWithRelationInput[] = {
      createdAt: orderBy
    }
    if (sortBy === SortBy.Name) {
      caculatedOrderBy = {
        name: orderBy
      }
    }
    return {
      skip,
      take,
      where,
      orderBy: caculatedOrderBy
    }
  }

  async list(pagination: GetRolesQueryType): Promise<GetRolesResType> {
    const { skip, take, where, orderBy } = this.generateFilter(pagination)
    const [totalItems, roles] = await Promise.all([
      this.prismaService.role.count({
        where
      }),
      this.prismaService.role.findMany({
        ...(!pagination.getAll && { skip, take }),
        where,
        orderBy
      })
    ])
    return {
      roles,
      totalItems,
      page: pagination.page,
      limit: pagination.getAll ? totalItems : pagination.limit,
      totalPages: pagination.getAll ? 1 : Math.ceil(totalItems / pagination.limit)
    }
  }

  async findById(id: number): Promise<RoleWithPermissionsType | null> {
    return this.prismaService.role.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: {
        permissions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  async create({ createdById, data }: { createdById: number; data: CreateRoleBodyType }): Promise<RoleType> {
    return this.prismaService.role.create({
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
    data: UpdateRoleBodyType
  }): Promise<RoleType> {
    if (data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissionIds
          }
        }
      })
      const deletedPermissions = permissions.filter((permission) => permission.deletedAt)
      if (deletedPermissions.length > 0) {
        const deletedIds = deletedPermissions.map((permission) => permission.id).join(', ')
        throw new Error(`Quyền có id ${deletedIds} đã bị xóa`)
      }
    }
    return this.prismaService.role.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        updatedById,
        permissions: {
          set: data.permissionIds.map((id) => ({ id }))
        }
      },
      include: {
        permissions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<RoleType> {
    return isHard
      ? this.prismaService.role.delete({
          where: {
            id
          }
        })
      : this.prismaService.role.update({
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
