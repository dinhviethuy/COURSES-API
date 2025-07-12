import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { CreateUserBodyType, GetUsersQueryType, UpdateUserBodyType } from './user.model'
import { UserRepo } from './user.repo'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private hashingService: HashingService,
    private sharedUserRepository: SharedUserRepository,
    private sharedRoleRepository: SharedRoleRepository
  ) {}

  list(pagination: GetUsersQueryType) {
    return this.userRepo.list(pagination)
  }

  async findById(userId: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id: userId
    })
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại')
    }
    return user
  }

  async create({
    data,
    createByRoleName,
    createdById
  }: {
    data: CreateUserBodyType
    createByRoleName: string
    createdById: number
  }) {
    try {
      // Chỉ có admin mới có quyền tạo user khác là admin
      await this.verifyRole({
        roleNameAgent: createByRoleName,
        roleIdTarget: data.roleId
      })
      const hashedPassword = await this.hashingService.hash(data.password)
      const user = await this.userRepo.create({
        data: {
          ...data,
          password: hashedPassword
        },
        createdById
      })
      return user
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new BadRequestException('Vai trò không tồn tại')
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Người dùng đã tồn tại')
      }
      throw error
    }
  }

  /**
   * Function này kiểm tra xem người thực hiện có quyền tác động đến người khác không.
   * Vì chỉ có người thực hiện là admin role mới có quyền sau: Tạo admin user, update roleId thành admin, xóa admin user.
   * Còn nếu không phải admin thì không được phép tác động đến admin
   */

  private async verifyRole({ roleNameAgent, roleIdTarget }: { roleNameAgent: string; roleIdTarget: number }) {
    if (roleNameAgent === RoleName.ADMIN) {
      return true
    } else {
      const adminRole = await this.sharedRoleRepository.getAdminRoleId()
      if (roleIdTarget === adminRole) {
        throw new ForbiddenException('Bạn không có quyền thực hiện hành động này')
      }
      return true
    }
  }

  async update({
    id,
    data,
    updatedByRoleName,
    updatedById
  }: {
    id: number
    data: UpdateUserBodyType
    updatedByRoleName: string
    updatedById: number
  }) {
    try {
      this.verifyYourself({
        userAgentId: updatedById,
        userTargetId: id
      })
      //Chỉ có Role Admin mới được xóa user với roleId là admin
      // Chỉ có admin mới có quyền update user khác là admin và xóa admin user
      const { roleId } = await this.getRoleIdByUserId(id)
      await Promise.all([
        this.verifyRole({
          roleNameAgent: updatedByRoleName,
          roleIdTarget: roleId
        }),
        this.verifyRole({
          roleNameAgent: updatedByRoleName,
          roleIdTarget: data.roleId
        })
      ])

      const updatedUser = await this.sharedUserRepository.update(
        {
          id
        },
        {
          ...data,
          updatedById
        }
      )
      return updatedUser
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Người dùng không tồn tại')
      }

      if (isForeignKeyConstraintPrismaError(error)) {
        throw new BadRequestException('Vai trò không tồn tại')
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Người dùng đã tồn tại')
      }
      throw error
    }
  }

  private async getRoleIdByUserId(userId: number) {
    const currentUser = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id: userId
    })
    if (!currentUser) {
      throw new NotFoundException('Người dùng không tồn tại')
    }
    return {
      roleId: currentUser.roleId,
      roleName: currentUser.role.name
    }
  }

  private verifyYourself({ userAgentId, userTargetId }: { userAgentId: number; userTargetId: number }) {
    if (userAgentId === userTargetId) {
      throw new ForbiddenException('Không thể cập nhật hoặc xóa chính mình')
    }
  }

  async delete({ id, deletedByRoleName, deletedById }: { id: number; deletedByRoleName: string; deletedById: number }) {
    try {
      // Không cho phép xóa chính mình
      this.verifyYourself({
        userAgentId: deletedById,
        userTargetId: id
      })
      // Chỉ có admin mới có quyền xóa admin user
      const { roleId } = await this.getRoleIdByUserId(id)
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget: roleId
      })

      await this.userRepo.delete({
        id,
        deletedById
      })
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Người dùng không tồn tại')
      }
      throw error
    }
  }
}
