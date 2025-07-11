import { RoleSchema } from 'src/shared/models/shared-role.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const GetUsersResSchema = z.object({
  users: z.array(
    UserSchema.omit({
      password: true
    }).extend({
      role: RoleSchema.pick({
        id: true,
        name: true
      })
    })
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
  })
  .strict()

export const GetUserParamsSchema = z
  .object({
    userId: z.coerce.number().int().positive()
  })
  .strict()

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  fullName: true,
  password: true,
  roleId: true,
  status: true
}).strict()

export const UpdateUserBodySchema = CreateUserBodySchema

export type GetUsersResType = z.infer<typeof GetUsersResSchema>
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>
