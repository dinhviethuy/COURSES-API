import { Controller, Get, Param, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetLessonDetailResDTO, GetLessonParamsDTO } from 'src/routes/lesson/lesson.dto'
import { LessonService } from 'src/routes/lesson/lesson.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get(':lessonId')
  @MessageRes('Lấy chi tiết bài học thành công')
  @ZodSerializerDto(GetLessonDetailResDTO)
  getDetail(@Param() params: GetLessonParamsDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.lessonService.getDetail({
      lessonId: params.lessonId,
      userId: user.userId,
      roleId: user.roleId
    })
  }

  @Post(':lessonId/complete')
  @MessageRes('Hoàn thành bài học thành công')
  completeLesson(@Param() params: GetLessonParamsDTO, @ActiveUser() user: SessionTokenPayload) {
    return this.lessonService.completeLesson({
      lessonId: params.lessonId,
      userId: user.userId,
      roleId: user.roleId
    })
  }
}
