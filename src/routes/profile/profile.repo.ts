import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { UserStatus } from 'src/shared/constants/user.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ChangePasswordBodyType, GetProfileResType, UpdateProfileBodyType, UpdateProfileResType } from './profile.model'

@Injectable()
export class ProfileRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService
  ) {}

  getProfile(userId: number): Promise<GetProfileResType | null> {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
        status: UserStatus.ACTIVE
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
        roleId: true
      }
    })
  }

  updateProfile(userId: number, data: UpdateProfileBodyType): Promise<UpdateProfileResType> {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null,
        status: UserStatus.ACTIVE
      },
      data
    })
  }

  async changePassword(
    userId: number,
    data: Omit<ChangePasswordBodyType, 'confirmNewPassword'>
  ): Promise<UpdateProfileResType> {
    const { password, newPassword } = data
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
        status: UserStatus.ACTIVE
      },
      select: {
        password: true
      }
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    const isPasswordValid = await this.hashingService.compare(password, user.password)
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password')
    }
    const hashedPassword = await this.hashingService.hash(newPassword)
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null,
        status: UserStatus.ACTIVE
      },
      data: { password: hashedPassword }
    })
  }
}
