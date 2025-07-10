import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import {
  CreateRoleBodyDTO,
  CreateRoleResDTO,
  GetRoleDetailResDTO,
  GetRoleParamsDTO,
  GetRolesQueryDTO,
  GetRolesResDTO,
  UpdateRoleBodyDTO
} from './role.dto'
import { RoleService } from './role.service'

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @MessageRes('Lấy danh sách vai trò thành công')
  @ZodSerializerDto(GetRolesResDTO)
  list(@Query() query: GetRolesQueryDTO) {
    return this.roleService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':roleId')
  @MessageRes('Lấy vai trò thành công')
  @ZodSerializerDto(GetRoleDetailResDTO)
  findById(@Param() param: GetRoleParamsDTO) {
    return this.roleService.findById(param.roleId)
  }

  @Post()
  @MessageRes('Tạo vai trò thành công')
  @ZodSerializerDto(CreateRoleResDTO)
  create(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.create({
      createdById: userId,
      data: body
    })
  }

  @Patch(':roleId')
  @MessageRes('Cập nhật vai trò thành công')
  @ZodSerializerDto(GetRoleDetailResDTO)
  update(@Param() param: GetRoleParamsDTO, @Body() body: UpdateRoleBodyDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.update({
      id: param.roleId,
      data: body,
      updatedById: userId
    })
  }

  @Delete(':roleId')
  @MessageRes('Xóa vai trò thành công')
  delete(@Param() param: GetRoleParamsDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.delete({
      id: param.roleId,
      deletedById: userId
    })
  }
}
