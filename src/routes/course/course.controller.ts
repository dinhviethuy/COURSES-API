import { Controller, Get, Param, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetCourseDetailResDTO,
  GetCourseParamsIdDTO,
  GetCourseParamsSlugDTO,
  GetCoursesQueryDTO,
  ListCoursesResDTO
} from 'src/routes/course/course.dto'
import { CourseService } from 'src/routes/course/course.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

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
