import { OTPType } from 'src/shared/constants/auth.constant'
import { UserStatus } from 'src/shared/constants/user.contant'
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string(),
  roleId: z.number().int().positive(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]).default(UserStatus.ACTIVE),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable()
})

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true
}).strict()

export const LoginResSchema = z.object({
  sessionToken: z.string()
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
export type UserType = z.infer<typeof UserSchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResType = z.infer<typeof RegisterResSchema>
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
