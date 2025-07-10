import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { ChangePasswordBodyDTO, GetProfileResDTO, UpdateProfileBodyDTO, UpdateProfileResDTO } from './profile.dto'
import { ProfileService } from './profile.service'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @MessageRes('Lấy thông tin thành công')
  @ZodSerializerDto(GetProfileResDTO)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }

  @Patch()
  @MessageRes('Cập nhật thông tin thành công')
  @ZodSerializerDto(UpdateProfileResDTO)
  updateProfile(@ActiveUser('userId') userId: number, @Body() body: UpdateProfileBodyDTO) {
    return this.profileService.updateProfile(userId, body)
  }

  @Patch('change-password')
  @MessageRes('Đổi mật khẩu thành công')
  changePassword(@ActiveUser('userId') userId: number, @Body() body: ChangePasswordBodyDTO) {
    return this.profileService.changePassword(userId, body)
  }
}
