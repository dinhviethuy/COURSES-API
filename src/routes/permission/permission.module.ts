import { Module } from '@nestjs/common'
import { PermissionController } from './permission.controller'
import { PermissionRepo } from './permission.repo'
import { PermissionService } from './permission.service'

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepo]
})
export class PermissionModule {}
