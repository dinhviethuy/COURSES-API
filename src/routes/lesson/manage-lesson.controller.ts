import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import {
  CreateLessonBodyDTO,
  CreateLessonResDTO,
  GetLessonDetailResDTO,
  GetLessonParamsDTO,
  UpdateLessonBodyDTO,
  UpdateLessonResDTO
} from './lesson.dto'
import { ManageLessonService } from './manage-lesson.service'

@Controller('manage-lessons')
export class ManageLessonController {
  constructor(private readonly manageLessonService: ManageLessonService) {}

  @Get(':lessonId')
  @MessageRes('Lấy chi tiết bài học thành công')
  @ZodSerializerDto(GetLessonDetailResDTO)
  getDetail(@Param() params: GetLessonParamsDTO) {
    return this.manageLessonService.getDetail(params.lessonId)
  }

  @Post()
  @MessageRes('Tạo bài học thành công')
  @ZodSerializerDto(CreateLessonResDTO)
  create(@Body() body: CreateLessonBodyDTO, @ActiveUser('userId') userId: number) {
    return this.manageLessonService.create(body, userId)
  }

  @Put(':lessonId')
  @MessageRes('Cập nhật bài học thành công')
  @ZodSerializerDto(UpdateLessonResDTO)
  update(@Param() params: GetLessonParamsDTO, @Body() body: UpdateLessonBodyDTO, @ActiveUser('userId') userId: number) {
    return this.manageLessonService.update({
      lessonId: params.lessonId,
      data: body,
      updatedById: userId
    })
  }

  @Delete(':lessonId')
  @MessageRes('Xóa bài học thành công')
  delete(@Param() params: GetLessonParamsDTO, @ActiveUser('userId') userId: number) {
    return this.manageLessonService.delete({ lessonId: params.lessonId, deletedById: userId })
  }
}
