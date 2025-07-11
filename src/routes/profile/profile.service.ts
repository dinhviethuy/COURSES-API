import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { ChangePasswordBodyType, UpdateProfileBodyType } from './profile.model'
import { ProfileRepo } from './profile.repo'

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepo) {}

  async getProfile(userId: number) {
    try {
      const profile = await this.profileRepo.getProfile(userId)
      if (!profile) {
        throw new NotFoundException('Không tìm thấy tài khoản')
      }
      return profile
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new NotFoundException('Không tìm thấy tài khoản')
    }
  }

  updateProfile(userId: number, data: UpdateProfileBodyType) {
    try {
      return this.profileRepo.updateProfile(userId, data)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy tài khoản')
      }
      throw new BadRequestException('Lỗi khi cập nhật tài khoản')
    }
  }

  async changePassword(userId: number, data: ChangePasswordBodyType) {
    try {
      await this.profileRepo.changePassword(userId, data)
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy tài khoản')
      }
      throw new BadRequestException('Lỗi khi thay đổi mật khẩu')
    }
  }
}
