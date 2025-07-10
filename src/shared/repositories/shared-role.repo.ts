import { Injectable } from '@nestjs/common'
import { RoleName } from '../constants/role.constant'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class SharedRoleRepository {
  private studentRoleId: number | null = null
  private adminRoleId: number | null = null
  private teacherRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string) {
    const role = await this.prismaService.$queryRaw`
      SELECT * FROM "Role" WHERE name = ${roleName} AND "deletedAt" IS NULL LIMIT 1
    `.then((res: any[]) => {
      if (res.length === 0) {
        throw new Error('Role not found')
      }
      return res[0]
    })
    return role
  }

  async getStudentRoleId() {
    if (this.studentRoleId) {
      return this.studentRoleId
    }
    const role = await this.getRole(RoleName.STUDENT)

    this.studentRoleId = role.id
    return role.id
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId
    }
    const role = await this.getRole(RoleName.ADMIN)

    this.adminRoleId = role.id
    return role.id
  }

  async getTeacherRoleId() {
    if (this.teacherRoleId) {
      return this.teacherRoleId
    }
    const role = await this.getRole(RoleName.TEACHER)

    this.teacherRoleId = role.id
    return role.id
  }
}
