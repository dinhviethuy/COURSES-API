import { Module } from '@nestjs/common'
import { RoleController } from './role.controller'
import { RoleRepo } from './role.repo'
import { RoleService } from './role.service'

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepo]
})
export class RoleModule {}
