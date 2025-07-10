import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model'
import { PermissionRepo } from './permission.repo'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}

  async list(pagination: GetPermissionsQueryType) {
    const data = await this.permissionRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const permisson = await this.permissionRepo.findById(id)
    if (!permisson) {
      throw new NotFoundException('Permission not found')
    }
    return permisson
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepo.create({
        createdById,
        data
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Permission already exists')
      }
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdatePermissionBodyType; updatedById: number }) {
    try {
      const permisson = await this.permissionRepo.update({
        id,
        updatedById,
        data
      })
      return permisson
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Permission not found')
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Permission already exists')
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.permissionRepo.delete({ id, deletedById }, true)
      return {}
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Permission not found')
      }
      throw error
    }
  }
}
