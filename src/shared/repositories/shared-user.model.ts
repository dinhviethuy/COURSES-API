import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email
      }
    })
  }

  findUniqueWithRole(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email
      },
      include: { role: true }
    })
  }
}
