import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateUserBodyDTO,
  CreateUserResDTO,
  GetUserParamsDTO,
  GetUsersQueryDTO,
  GetUsersResDTO,
  UpdateUserBodyDTO
} from 'src/routes/user/user.dto'
import { UserService } from 'src/routes/user/user.service'
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permissions.decorator'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @MessageRes('Lấy danh sách người dùng thành công')
  @ZodSerializerDto(GetUsersResDTO)
  list(@Query() query: GetUsersQueryDTO) {
    return this.userService.list({
      limit: query.limit,
      page: query.page,
      orderBy: query.orderBy,
      sortBy: query.sortBy,
      search: query.search,
      status: query.status,
      roleId: query.roleId,
      getAll: query.getAll
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

  @Put(':userId')
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
