import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permissions.decorator'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'
import {
  CreateUserBodyDTO,
  CreateUserResDTO,
  GetUserParamsDTO,
  GetUsersQueryDTO,
  GetUsersResDTO,
  UpdateUserBodyDTO
} from './user.dto'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @MessageRes('Lấy danh sách người dùng thành công')
  @ZodSerializerDto(GetUsersResDTO)
  list(@Query() query: GetUsersQueryDTO) {
    return this.userService.list({
      limit: query.limit,
      page: query.page
    })
  }

  @Get(':userId')
  @MessageRes('Lấy thông tin người dùng thành công')
  @ZodSerializerDto(GetUserProfileResDTO)
  get(@Param() param: GetUserParamsDTO) {
    return this.userService.findById(param.userId)
  }

  @Post()
  @MessageRes('Tạo người dùng thành công')
  @ZodSerializerDto(CreateUserResDTO)
  create(
    @Body() body: CreateUserBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.userService.create({
      data: body,
      createByRoleName: roleName,
      createdById: userId
    })
  }

  @Patch(':userId')
  @MessageRes('Cập nhật người dùng thành công')
  @ZodSerializerDto(UpdateProfileResDTO)
  update(
    @Param() param: GetUserParamsDTO,
    @Body() body: UpdateUserBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.userService.update({
      data: body,
      id: param.userId,
      updatedById: userId,
      updatedByRoleName: roleName
    })
  }

  @Delete(':userId')
  @MessageRes('Xoá người dùng thành công')
  delete(
    @Param() param: GetUserParamsDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.userService.delete({
      id: param.userId,
      deletedById: userId,
      deletedByRoleName: roleName
    })
  }
}
