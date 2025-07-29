import { OrderBy, SortBy } from 'src/shared/constants/other.constant'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { z } from 'zod'

export const GetPermissionsResSchema = z.object({
  permissions: z.array(PermissionSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetPermissionsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    getAll: z
      .preprocess((value: any) => {
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true'
        }
        return false
      }, z.boolean())
      .optional(),
    module: z.string().optional(),
    method: z
      .enum([
        HTTPMethod.GET,
        HTTPMethod.POST,
        HTTPMethod.PUT,
        HTTPMethod.DELETE,
        HTTPMethod.PATCH,
        HTTPMethod.OPTIONS,
        HTTPMethod.HEAD
      ])
      .optional(),
    path: z.string().optional(),
    name: z.string().optional(),
    orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
    sortBy: z.enum([SortBy.CreatedAt, SortBy.Name]).default(SortBy.CreatedAt)
  })
  .strict()

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number()
  })
  .strict()

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
  module: true
}).strict()

export const GetModulesResSchema = z.object({
  modules: z.array(
    z.object({
      module: z.string()
    })
  )
})

export const UpdatePermissionBodySchema = CreatePermissionBodySchema
export const GetPermissionDetailResSchema = PermissionSchema
export type PermissionType = z.infer<typeof PermissionSchema>
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>
export type GetModulesResType = z.infer<typeof GetModulesResSchema>
