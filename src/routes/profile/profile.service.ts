import { Injectable } from '@nestjs/common'
import { ChangePasswordBodyType, UpdateProfileBodyType } from './profile.model'
import { ProfileRepo } from './profile.repo'

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepo) {}

  getProfile(userId: number) {
    return this.profileRepo.getProfile(userId)
  }

  updateProfile(userId: number, data: UpdateProfileBodyType) {
    return this.profileRepo.updateProfile(userId, data)
  }

  async changePassword(userId: number, data: ChangePasswordBodyType) {
    await this.profileRepo.changePassword(userId, data)
    return {}
  }
}
