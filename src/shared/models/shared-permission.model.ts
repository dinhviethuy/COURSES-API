import { z } from 'zod'
import { HTTPMethod } from '../constants/role.constant'

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  path: z.string().max(1000),
  module: z.string().max(500),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD
  ]),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type PermissionType = z.infer<typeof PermissionSchema>
