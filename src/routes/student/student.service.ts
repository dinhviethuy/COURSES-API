import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateCourseEnrollmentBodyType,
  CreateCourseEnrollmentResType,
  GetCourseEnrollmentDetailResType,
  GetCourseEnrollmentListResType,
  GetCourseEnrollmentQueryType,
  UpdateCourseEnrollmentBodyType,
  UpdateCourseEnrollmentResType
} from 'src/routes/student/student.model'
import { StudentRepo } from 'src/routes/student/student.repo'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class StudentService {
  constructor(private readonly studentRepo: StudentRepo) {}

  listStudents({
    query,
    userId,
    roleId
  }: {
    roleId: number
    userId: number
    query: GetCourseEnrollmentQueryType
  }): Promise<GetCourseEnrollmentListResType> {
    return this.studentRepo.listStudents({ query, userId, roleId })
  }

  async getStudentDetail({
    courseEnrollmentId,
    userId,
    roleId
  }: {
    courseEnrollmentId: number
    userId: number
    roleId: number
  }): Promise<GetCourseEnrollmentDetailResType> {
    try {
      const student = await this.studentRepo.getStudentDetail({
        courseEnrollmentId,
        userId,
        roleId
      })
      if (!student) {
        throw new NotFoundException('Không tìm thấy học viên')
      }
      return student
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new BadRequestException('Lỗi khi lấy thông tin học viên')
    }
  }

  async createStudent({
    data,
    createdById,
    roleId
  }: {
    createdById: number
    roleId: number
    data: CreateCourseEnrollmentBodyType
  }): Promise<CreateCourseEnrollmentResType> {
    try {
      const student = await this.studentRepo.createCourseEnrollment({
        data,
        createdById,
        roleId
      })
      return student
    } catch (error) {
      if (error instanceof HttpException) throw error
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Học viên đã tồn tại')
      }
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy học viên hoặc khóa học')
      }
      throw new BadRequestException('Lỗi khi tạo học viên')
    }
  }

  async updateStudent({
    data,
    updatedById,
    roleId,
    courseEnrollmentId
  }: {
    updatedById: number
    roleId: number
    data: UpdateCourseEnrollmentBodyType
    courseEnrollmentId: number
  }): Promise<UpdateCourseEnrollmentResType> {
    try {
      const student = await this.studentRepo.updateCourseEnrollment({
        data,
        updatedById,
        roleId,
        courseEnrollmentId
      })
      return student
    } catch (error) {
      if (error instanceof HttpException) throw error
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Học viên đã tồn tại')
      }
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy học viên')
      }
      throw new BadRequestException('Lỗi khi cập nhật học viên')
    }
  }

  async deleteStudent({
    courseEnrollmentId,
    deletedById,
    roleId
  }: {
    courseEnrollmentId: number
    deletedById: number
    roleId: number
  }) {
    try {
      await this.studentRepo.deleteCourseEnrollment({
        courseEnrollmentId,
        deletedById,
        roleId
      })
      return true
    } catch (error) {
      if (error instanceof HttpException) throw error
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy học viên')
      }
      throw new BadRequestException('Lỗi khi xóa học viên')
    }
  }
}
