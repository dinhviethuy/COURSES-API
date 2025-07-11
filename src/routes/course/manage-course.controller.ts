import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import {
  CreateCourseBodyDTO,
  CreateCourseResDTO,
  GetCourseDetailResDTOForAdmin,
  GetCourseParamsDTO,
  GetManageCoursesQueryDTO,
  ListCoursesResDTO,
  ReorderChaptersAndLessonsBodyDTO,
  UpdateCourseBodyDTO,
  UpdateCourseResDTO
} from './course.dto'
import { ManageCourseService } from './manage-course.service'

@Controller('manage-courses')
export class ManageCourseController {
  constructor(private readonly manageCourseService: ManageCourseService) {}

  @Get()
  @MessageRes('Lấy danh sách khóa học thành công')
  @ZodSerializerDto(ListCoursesResDTO)
  async listCourses(@Query() query: GetManageCoursesQueryDTO) {
    return this.manageCourseService.listCourses(query)
  }

  @Get(':courseId')
  @MessageRes('Lấy chi tiết khóa học thành công')
  @ZodSerializerDto(GetCourseDetailResDTOForAdmin)
  async getCourseDetail(@Param() param: GetCourseParamsDTO) {
    return this.manageCourseService.getCourseDetailForAdmin(param.courseId)
  }

  @Post()
  @MessageRes('Tạo khóa học thành công')
  @ZodSerializerDto(CreateCourseResDTO)
  async createCourse(@Body() body: CreateCourseBodyDTO, @ActiveUser('userId') userId: number) {
    try {
      const course = await this.manageCourseService.createCourse(body, userId)
      return course
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Slug đã tồn tại')
      }
      throw error
    }
  }

  @Put(':courseId')
  @MessageRes('Cập nhật khóa học thành công')
  @ZodSerializerDto(UpdateCourseResDTO)
  async updateCourse(
    @Param() param: GetCourseParamsDTO,
    @Body() body: UpdateCourseBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    try {
      const course = await this.manageCourseService.updateCourse({
        courseId: param.courseId,
        data: body,
        updatedById: userId
      })
      return course
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Slug đã tồn tại')
      }
      throw error
    }
  }

  @Patch(':courseId/reorder-full')
  @MessageRes('Sắp xếp lại khóa học thành công')
  async reorderChaptersAndLessons(
    @Param() param: GetCourseParamsDTO,
    @Body() body: ReorderChaptersAndLessonsBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.manageCourseService.reorderChaptersAndLessons({
      courseId: param.courseId,
      chapters: body.chapters,
      updatedById: userId
    })
  }

  @Delete(':courseId')
  @MessageRes('Xóa khóa học thành công')
  async deleteCourse(@Param() param: GetCourseParamsDTO, @ActiveUser('userId') userId: number) {
    return this.manageCourseService.deleteCourse({
      courseId: param.courseId,
      deletedById: userId
    })
  }
}
