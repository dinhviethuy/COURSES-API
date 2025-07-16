import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CanAccessCourseBodyDTO,
  GetCourseDetailResDTO,
  GetCourseParamsIdDTO,
  GetCourseParamsSlugDTO,
  GetCoursesQueryDTO,
  ListCoursesResDTO
} from 'src/routes/course/course.dto'
import { CourseService } from 'src/routes/course/course.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @MessageRes('Kiểm tra quyền truy cập khóa học thành công')
  canAccessCourse(@Body() body: CanAccessCourseBodyDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.courseService.canAccessCourse({
      where: body,
      userId: user.userId,
      roleId: user.roleId
    })
  }

  @Get()
  @IsPublic()
  @MessageRes('Lấy danh sách khóa học thành công')
  @ZodSerializerDto(ListCoursesResDTO)
  async listCourses(@Query() query: GetCoursesQueryDTO) {
    return this.courseService.listCourses(query)
  }

  @Get(':courseId')
  @IsPublic()
  @MessageRes('Lấy chi tiết khóa học thành công')
  @ZodSerializerDto(GetCourseDetailResDTO)
  async getCourseDetail(@Param() param: GetCourseParamsIdDTO) {
    return this.courseService.getCourseDetail({ id: param.courseId })
  }

  @Get('slugs/:slug')
  @IsPublic()
  @MessageRes('Lấy chi tiết khóa học thành công')
  @ZodSerializerDto(GetCourseDetailResDTO)
  async getCourseDetailBySlug(@Param() param: GetCourseParamsSlugDTO) {
    return this.courseService.getCourseDetail({ slug: param.slug })
  }
}
