import { Body, Controller, Get, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ChangePasswordBodyDTO, GetProfileResDTO, UpdateProfileBodyDTO } from 'src/routes/profile/profile.dto'
import { ProfileService } from 'src/routes/profile/profile.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @MessageRes('Lấy thông tin thành công')
  @ZodSerializerDto(GetProfileResDTO)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }

  @Put()
  @MessageRes('Cập nhật thông tin thành công')
  @ZodSerializerDto(UpdateProfileResDTO)
  updateProfile(@ActiveUser('userId') userId: number, @Body() body: UpdateProfileBodyDTO) {
    return this.profileService.updateProfile(userId, body)
  }

  @Put('change-password')
  @MessageRes('Đổi mật khẩu thành công')
  changePassword(@ActiveUser('userId') userId: number, @Body() body: ChangePasswordBodyDTO) {
    return this.profileService.changePassword(userId, body)
  }
}
