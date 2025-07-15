import { OrderBy, SortBy } from 'src/shared/constants/other.constant'
import { UserStatus } from 'src/shared/constants/user.constant'
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
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    status: z.preprocess((value) => {
      if (typeof value === 'string') {
        const lowered = value.trim().toLowerCase()
        if (lowered === UserStatus.ACTIVE.toLowerCase()) return UserStatus.ACTIVE
        if (lowered === UserStatus.BLOCKED.toLowerCase()) return UserStatus.BLOCKED
        return undefined
      }
      return undefined
    }, z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]).optional()),
    roleId: z.preprocess((value) => {
      if (typeof value === 'string') {
        const number = Number(value.trim())
        if (isNaN(number) || number <= 0) return undefined
        return number
      }
      return undefined
    }, z.coerce.number().int().positive().optional()),
    orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
    sortBy: z.enum([SortBy.FullName, SortBy.Email, SortBy.CreatedAt]).default(SortBy.CreatedAt),
    getAll: z.preprocess((value: any) => {
        if (typeof value === 'string') {
          return value.toLowerCase().trim() === 'true'
        }
        return false
      }, z.boolean()).optional()
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

export const UpdateUserBodySchema = CreateUserBodySchema.extend({
  password: z.string().min(6).optional()
})

export type GetUsersResType = z.infer<typeof GetUsersResSchema>
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>
