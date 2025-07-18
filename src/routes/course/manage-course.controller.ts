import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCourseBodyDTO,
  CreateCourseResDTO,
  GetCourseDetailResDTOForAdmin,
  GetCourseParamsIdDTO,
  GetManageCoursesQueryDTO,
  ListCoursesResDTO,
  ReorderChaptersAndLessonsBodyDTO,
  UpdateCourseBodyDTO,
  UpdateCourseResDTO,
  ValidateSlugBodyDTO
} from 'src/routes/course/course.dto'
import { ManageCourseService } from 'src/routes/course/manage-course.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'

@Controller('manage-courses')
export class ManageCourseController {
  constructor(private readonly manageCourseService: ManageCourseService) {}

  @Get()
  @MessageRes('Lấy danh sách khóa học thành công')
  @ZodSerializerDto(ListCoursesResDTO)
  async listCourses(@Query() query: GetManageCoursesQueryDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.manageCourseService.listCourses({
      query,
      roleId: user.roleId,
      userId: user.userId
    })
  }

  @Get(':courseId')
  @MessageRes('Lấy chi tiết khóa học thành công')
  @ZodSerializerDto(GetCourseDetailResDTOForAdmin)
  async getCourseDetail(@Param() param: GetCourseParamsIdDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.manageCourseService.getCourseDetailForAdmin({
      courseId: param.courseId,
      roleId: user.roleId,
      userId: user.userId
    })
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
        throw new BadRequestException('Slug đã tồn tại, vui lòng chọn slug khác')
      }
      throw error
    }
  }

  @Put(':courseId')
  @MessageRes('Cập nhật khóa học thành công')
  @ZodSerializerDto(UpdateCourseResDTO)
  async updateCourse(
    @Param() param: GetCourseParamsIdDTO,
    @Body() body: UpdateCourseBodyDTO,
    @ActiveUser() user: SessionTokenPayload
  ) {
    try {
      const course = await this.manageCourseService.updateCourse({
        courseId: param.courseId,
        data: body,
        updatedById: user.userId,
        roleId: user.roleId
      })
      return course
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException('Slug đã tồn tại, vui lòng chọn slug khác')
      }
      throw error
    }
  }

  @Patch(':courseId/reorder-full')
  @MessageRes('Sắp xếp lại khóa học thành công')
  async reorderChaptersAndLessons(
    @Param() param: GetCourseParamsIdDTO,
    @Body() body: ReorderChaptersAndLessonsBodyDTO,
    @ActiveUser() user: SessionTokenPayload
  ) {
    return this.manageCourseService.reorderChaptersAndLessons({
      courseId: param.courseId,
      chapters: body.chapters,
      updatedById: user.userId,
      roleId: user.roleId
    })
  }

  @Delete(':courseId')
  @MessageRes('Xóa khóa học thành công')
  async deleteCourse(@Param() param: GetCourseParamsIdDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.manageCourseService.deleteCourse({
      courseId: param.courseId,
      deletedById: user.userId,
      roleId: user.roleId
    })
  }

  @Post('validate-slug')
  @MessageRes('Kiểm tra slug khóa học thành công')
  async validateSlug(@Body() body: ValidateSlugBodyDTO) {
    return this.manageCourseService.validateSlug(body)
  }
}
