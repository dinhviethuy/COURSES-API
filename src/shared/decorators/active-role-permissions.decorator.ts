import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_ROLE_PERMISSIONS } from 'src/shared/constants/auth.constant'
import { RolePermissionsType } from 'src/shared/models/shared-role.model'

export const ActiveRolePermissions = createParamDecorator(
  (feild: keyof RolePermissionsType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const rolePermissions: RolePermissionsType | undefined = request[REQUEST_ROLE_PERMISSIONS]
    return feild ? rolePermissions?.[feild] : rolePermissions
  }
)
