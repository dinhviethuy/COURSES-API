import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from './role.model'
import { RoleRepo } from './role.repo'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}

  async list(pagination: GetRolesQueryType) {
    const data = await this.roleRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw new NotFoundException('Role not found')
    }
    return role
  }

  async create({ createdById, data }: { createdById: number; data: CreateRoleBodyType }) {
    try {
      const role = await this.roleRepo.create({
        createdById,
        data
      })
      return role
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Role already exists')
      }
      throw error
    }
  }
  /**
   * Kiểm tra xem role có phải là 1 trong 3 role cơ bản không
   */
  private async verifyRole(roleId: number) {
    const role = await this.roleRepo.findById(roleId)
    if (!role) {
      throw new NotFoundException('Role not found')
    }
    const baseRoles: string[] = [RoleName.ADMIN, RoleName.STUDENT, RoleName.TEACHER]

    if (baseRoles.includes(role.name)) {
      throw new BadRequestException('Prohibited action on base role')
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
    try {
      await this.verifyRole(id)
      const updatedRole = await this.roleRepo.update({
        id,
        data,
        updatedById
      })
      return updatedRole
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Role not found')
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Role already exists')
      }

      throw error
    }
  }
  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.verifyRole(id)
      await this.roleRepo.delete(
        {
          id,
          deletedById
        },
        true
      )
      return {}
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Role not found')
      }
      throw error
    }
  }
}
