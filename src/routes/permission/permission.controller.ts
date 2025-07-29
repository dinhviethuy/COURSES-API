import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreatePermissionBodyDTO,
  GetModulesResDTO,
  GetPermissionDetailResDTO,
  GetPermissionParamsDTO,
  GetPermissionsQueryDTO,
  GetPermissionsResDTO,
  UpdatePermissionBodyDTO
} from 'src/routes/permission/permission.dto'
import { PermissionService } from 'src/routes/permission/permission.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @MessageRes('Lấy danh sách quyền thành công')
  @ZodSerializerDto(GetPermissionsResDTO)
  list(@Query() query: GetPermissionsQueryDTO) {
    return this.permissionService.list({
      page: query.page,
      limit: query.limit,
      getAll: query.getAll,
      method: query.method,
      module: query.module,
      name: query.name,
      path: query.path
    })
  }

  @Get('/modules')
  @MessageRes('Lấy danh sách module thành công')
  @ZodSerializerDto(GetModulesResDTO)
  getModules() {
    return this.permissionService.getModules()
  }

  @Get(':permissionId')
  @MessageRes('Lấy quyền thành công')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  findById(@Param() param: GetPermissionParamsDTO) {
    return this.permissionService.findById(param.permissionId)
  }

  @Post()
  @MessageRes('Tạo quyền thành công')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  create(@ActiveUser('userId') userId: number, @Body() body: CreatePermissionBodyDTO) {
    return this.permissionService.create({
      createdById: userId,
      data: body
    })
  }

  @Put(':permissionId')
  @MessageRes('Cập nhật quyền thành công')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  update(
    @ActiveUser('userId') userId: number,
    @Body() body: UpdatePermissionBodyDTO,
    @Param() param: GetPermissionParamsDTO
  ) {
    return this.permissionService.update({
      data: body,
      updatedById: userId,
      id: param.permissionId
    })
  }

  @Delete(':permissionId')
  @MessageRes('Xóa quyền thành công')
  delete(@ActiveUser('userId') userId: number, @Param() param: GetPermissionParamsDTO) {
    return this.permissionService.delete({
      deletedById: userId,
      id: param.permissionId
    })
  }
}
