import { Injectable } from '@nestjs/common'
import { RoleType } from 'src/shared/models/shared-role.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  GetRolesResType,
  RoleWithPermissionsType,
  UpdateRoleBodyType
} from './role.model'

@Injectable()
export class RoleRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetRolesQueryType): Promise<GetRolesResType> {
    const skip = pagination.limit * (pagination.page - 1)
    const take = pagination.limit
    const [totalItems, roles] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.role.findMany({
        skip,
        take,
        where: {
          deletedAt: null
        }
      })
    ])
    return {
      roles,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit)
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
        throw new Error(`Permission with id has been deleted: ${deletedIds}`)
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
