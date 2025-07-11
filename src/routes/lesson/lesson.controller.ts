import { Controller, Get, Param } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'
import { GetLessonDetailResDTO, GetLessonParamsDTO } from './lesson.dto'
import { LessonService } from './lesson.service'

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
}
