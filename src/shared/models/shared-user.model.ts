import { UserStatus } from 'src/shared/constants/user.constant'
import z from 'zod'
import { PermissionSchema } from './shared-permission.model'
import { RoleSchema } from './shared-role.model'

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string(),
  roleId: z.number().int().positive(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]).default(UserStatus.ACTIVE),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable()
})

export const GetUserProfileResSchema = UserSchema.omit({
  password: true
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true
      })
    )
  })
})

export const UpdateProfileResSchema = UserSchema.omit({
  password: true
})

export type UserType = z.infer<typeof UserSchema>
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
