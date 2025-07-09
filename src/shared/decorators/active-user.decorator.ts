import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { SessionTokenPayload } from '../types/jwt.type'

type ActiveUserField = keyof SessionTokenPayload | 'sessionToken' | undefined

export const ActiveUser = createParamDecorator((field: ActiveUserField, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user
  return field ? user?.[field] : user
})
