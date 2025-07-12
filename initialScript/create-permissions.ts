import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { HTTPMethod, RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()

const TeacherModule = [
  'AUTH',
  'MEDIA',
  'PROFILE',
  'USERS',
  'COURSES',
  'MANAGE-COURSES',
  'CHAPTERS',
  'LESSONS',
  'MANAGE-LESSONS'
]
const StudentModule = ['AUTH', 'PROFILE', 'COURSES', 'LESSONS']

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3001)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  const permissionsInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null
    }
  })

  const availableRoutes: {
    path: string
    method: keyof typeof HTTPMethod
    name: string
    module: string
  }[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const method = String(layer.route?.stack[0].method).toUpperCase() as keyof typeof HTTPMethod
        const module = String(path.split('/')[1]).toUpperCase()
        return {
          path,
          method,
          name: `${method} ${path}`,
          module
        }
      }
    })
    .filter((item) => item !== undefined)

  const permissionInDbMap: Record<string, (typeof permissionsInDb)[0]> = permissionsInDb.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  const permissionsToDelete = permissionsInDb.filter((item) => {
    return !availableRoutesMap[`${item.method}-${item.path}`]
  })

  if (permissionsToDelete.length > 0) {
    const deleteResult = await prisma.permission.deleteMany({
      where: {
        id: {
          in: permissionsToDelete.map((item) => item.id)
        }
      }
    })
    console.log('Deleted permissions:', deleteResult.count)
  } else {
    console.log('No permissions to delete')
  }

  const routesToAdd = availableRoutes.filter((item) => {
    return !permissionInDbMap[`${item.method}-${item.path}`]
  })

  if (routesToAdd.length > 0) {
    const permissionsToAdd = await prisma.permission.createMany({
      data: routesToAdd,
      skipDuplicates: true
    })
    console.log('Added permissions:', permissionsToAdd.count)
  } else {
    console.log('No permissions to add')
  }

  const updatedPermissionsInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null
    }
  })

  const adminPermissionIds = updatedPermissionsInDb.map((item) => ({
    id: item.id
  }))
  const teacherPermissionIds = updatedPermissionsInDb
    .filter((item) => TeacherModule.includes(item.module))
    .map((item) => ({
      id: item.id
    }))
  const studentPermissionIds = updatedPermissionsInDb
    .filter((item) => StudentModule.includes(item.module))
    .map((item) => ({
      id: item.id
    }))

  await Promise.all([
    updateRole(adminPermissionIds, RoleName.ADMIN),
    updateRole(teacherPermissionIds, RoleName.TEACHER),
    updateRole(studentPermissionIds, RoleName.STUDENT)
  ])

  process.exit(0)
}

const updateRole = async (permissonIds: { id: number }[], roleName: string) => {
  const role = await prisma.role.findFirstOrThrow({
    where: {
      name: roleName,
      deletedAt: null
    }
  })

  await prisma.role.update({
    where: {
      id: role.id
    },
    data: {
      permissions: {
        set: permissonIds
      }
    }
  })
  console.log(`Updated ${roleName} role with permissions`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
