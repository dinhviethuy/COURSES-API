import { Injectable } from '@nestjs/common'
import { PermissionType } from '../models/shared-permission.model'
import { RoleType } from '../models/shared-role.model'
import { UserType } from '../models/shared-user.model'
import { PrismaService } from '../services/prisma.service'

type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } }

export type WhereUniqueUserType = { id: number } | { email: string }

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
    return await this.prismaService.user.findFirst({
      where: {
        deletedAt: null,
        ...where
      }
    })
  }

  async findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
    return await this.prismaService.user.findFirst({
      where: {
        deletedAt: null,
        ...where
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null
              }
            }
          }
        }
      }
    })
  }

  async update(where: { id: number }, data: Partial<UserType>): Promise<UserType | null> {
    return await this.prismaService.user.update({
      where: {
        deletedAt: null,
        ...where
      },
      data
    })
  }
}
