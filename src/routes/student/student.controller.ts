import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCourseEnrollmentResDTO,
  GetCourseEnrollmentDetailResDTO,
  GetCourseEnrollmentListResDTO,
  GetCourseEnrollmentParamsDTO,
  GetCourseEnrollmentQueryDTO,
  UpdateCourseEnrollmentResDTO
} from 'src/routes/student/student.dto'
import { StudentService } from 'src/routes/student/student.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'
import { CreateCourseEnrollmentBodyDTO, UpdateCourseEnrollmentBodyDTO } from './student.dto'

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @MessageRes('Lấy danh sách học viên thành công')
  @ZodSerializerDto(GetCourseEnrollmentListResDTO)
  listStudents(@Query() query: GetCourseEnrollmentQueryDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.studentService.listStudents({ query, userId: user.userId, roleId: user.roleId })
  }

  @Get(':courseEnrollmentId')
  @MessageRes('Lấy thông tin học viên thành công')
  @ZodSerializerDto(GetCourseEnrollmentDetailResDTO)
  getStudentDetail(@Param() params: GetCourseEnrollmentParamsDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.studentService.getStudentDetail({
      courseEnrollmentId: params.courseEnrollmentId,
      userId: user.userId,
      roleId: user.roleId
    })
  }

  @Post()
  @MessageRes('Tạo học viên thành công')
  @ZodSerializerDto(CreateCourseEnrollmentResDTO)
  createStudent(@Body() body: CreateCourseEnrollmentBodyDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.studentService.createStudent({ data: body, createdById: user.userId, roleId: user.roleId })
  }

  @Put(':courseEnrollmentId')
  @MessageRes('Cập nhật học viên thành công')
  @ZodSerializerDto(UpdateCourseEnrollmentResDTO)
  updateStudent(
    @Param() params: GetCourseEnrollmentParamsDTO,
    @Body() body: UpdateCourseEnrollmentBodyDTO,
    @ActiveUser() user: SessionTokenPayload
  ) {
    return this.studentService.updateStudent({
      courseEnrollmentId: params.courseEnrollmentId,
      data: body,
      updatedById: user.userId,
      roleId: user.roleId
    })
  }

  @Delete(':courseEnrollmentId')
  @MessageRes('Xóa học viên thành công')
  deleteStudent(@Param() params: GetCourseEnrollmentParamsDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.studentService.deleteStudent({
      courseEnrollmentId: params.courseEnrollmentId,
      deletedById: user.userId,
      roleId: user.roleId
    })
  }
}
