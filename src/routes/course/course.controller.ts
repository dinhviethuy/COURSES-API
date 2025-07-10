import { Controller, Get, Param, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { GetCourseDetailResDTO, GetCourseParamsDTO, GetCoursesQueryDTO, ListCoursesResDTO } from './course.dto'
import { CourseService } from './course.service'

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
  async getCourseDetail(@Param() param: GetCourseParamsDTO) {
    return this.courseService.getCourseDetail(param.courseId)
  }
}
