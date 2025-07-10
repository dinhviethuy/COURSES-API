import { UserStatus } from 'src/shared/constants/user.contant'
import z from 'zod'

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

export type UserType = z.infer<typeof UserSchema>
