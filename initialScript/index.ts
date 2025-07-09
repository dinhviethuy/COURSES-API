import { Logger } from '@nestjs/common'
import { envConfig } from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.contant'
import { UserStatus } from 'src/shared/constants/user.contant'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
const hashing = new HashingService()
const logger = new Logger('SeedData')

const main = async () => {
  const dataInDb = await prisma.user.findMany()
  if (dataInDb.length > 0) {
    logger.log('Data already exists, skipping seeding')
    return
  }
  const [adminRole, studentRole, teacherRole] = await Promise.all([
    prisma.role.create({
      data: {
        name: RoleName.ADMIN,
        description: 'Admin role'
      }
    }),
    prisma.role.create({
      data: {
        name: RoleName.STUDENT,
        description: 'Student role'
      }
    }),
    prisma.role.create({
      data: {
        name: RoleName.TEACHER,
        description: 'Teacher role'
      }
    })
  ])

  const hashedPassword = await hashing.hash(envConfig.ADMIN_PASSWORD)
  const [count] = await Promise.all([
    prisma.role.count(),
    prisma.user.create({
      data: {
        email: envConfig.ADMIN_EMAIL,
        password: hashedPassword,
        roleId: adminRole.id,
        status: UserStatus.ACTIVE,
        fullName: envConfig.ADMIN_NAME
      }
    })
  ])
  logger.log(`Đã tạo tất cả ${count} roles`)
  logger.log(`Admin user created: ${envConfig.ADMIN_EMAIL}`)
  logger.log('Seeding data completed')
  process.exit(0)
}

main().catch((error) => {
  logger.error(error)
  process.exit(1)
})
