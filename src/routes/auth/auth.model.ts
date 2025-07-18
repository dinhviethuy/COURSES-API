import { OTPType } from 'src/shared/constants/auth.constant'
import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { RoleSchema } from 'src/shared/models/shared-role.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true
}).strict()

export const LoginResSchema = UserSchema.pick({
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

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  fullName: true
})
  .extend({
    otp: z.string().min(6).max(6),
    confirmPassword: z.string().min(6)
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password and confirm password do not match' })
    }
  })

export const RegisterResSchema = LoginResSchema

export const SendOTPBodySchema = z.object({
  email: z.string().email(),
  type: z.enum([OTPType.REGISTER, OTPType.FORGOT_PASSWORD])
})

export const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email(),
    newPassword: z.string().min(6),
    confirmNewPassword: z.string().min(6),
    otp: z.string().min(6).max(6)
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'New password and confirm new password do not match' })
    }
  })

export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResType = z.infer<typeof RegisterResSchema>
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>
