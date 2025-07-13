import { Module } from '@nestjs/common'
import { PermissionController } from 'src/routes/permission/permission.controller'
import { PermissionRepo } from 'src/routes/permission/permission.repo'
import { PermissionService } from 'src/routes/permission/permission.service'

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepo]
})
export class PermissionModule {}
