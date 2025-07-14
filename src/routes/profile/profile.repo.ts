import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ChangePasswordBodyType, GetProfileResType, UpdateProfileBodyType } from 'src/routes/profile/profile.model'
import { UserStatus } from 'src/shared/constants/user.constant'
import { UpdateProfileResType } from 'src/shared/models/shared-user.model'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

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
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                id: true,
                name: true,
                method: true,
                path: true,
                module: true
              },
              where: {
                deletedAt: null
              }
            }
          }
        }
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
      throw new NotFoundException('Người dùng không tồn tại')
    }
    const isPasswordValid = await this.hashingService.compare(password, user.password)
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu không hợp lệ')
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
