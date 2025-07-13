import { Module } from '@nestjs/common'
import { RoleController } from 'src/routes/role/role.controller'
import { RoleRepo } from 'src/routes/role/role.repo'
import { RoleService } from 'src/routes/role/role.service'

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepo]
})
export class RoleModule {}
