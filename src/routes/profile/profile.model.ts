import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { RoleSchema } from 'src/shared/models/shared-role.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import z from 'zod'

export const GetProfileResSchema = UserSchema.pick({
  id: true,
  email: true,
  fullName: true,
  status: true,
  roleId: true
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        method: true,
        path: true,
        module: true
      })
    )
  })
})

export const UpdateProfileBodySchema = UserSchema.pick({
  fullName: true
}).strict()

export const UpdateProfileResSchema = GetProfileResSchema

export const ChangePasswordBodySchema = z
  .object({
    password: z.string().min(6),
    newPassword: z.string().min(6),
    confirmNewPassword: z.string().min(6)
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'New password and confirm new password do not match' })
    }
    if (data.password === data.newPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'New password and old password cannot be the same' })
    }
  })

export type GetProfileResType = z.infer<typeof GetProfileResSchema>
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
