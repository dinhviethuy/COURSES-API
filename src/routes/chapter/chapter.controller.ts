import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import {
  CreateChaperBodyDTO,
  CreateChaperResDTO,
  GetChapterParamsDTO,
  UpdateChaperBodyDTO,
  UpdateChaperResDTO
} from './chapter,dto'
import { ChapterService } from './chapter.service'

@Controller('chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  @MessageRes('Tạo chương thành công')
  @ZodSerializerDto(CreateChaperResDTO)
  async createChapter(@Body() body: CreateChaperBodyDTO, @ActiveUser('userId') userId: number) {
    return this.chapterService.createChapter(body, userId)
  }

  @Put(':chapterId')
  @MessageRes('Cập nhật chương thành công')
  @ZodSerializerDto(UpdateChaperResDTO)
  async updateChapter(
    @Param() param: GetChapterParamsDTO,
    @Body() body: UpdateChaperBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.chapterService.updateChapter({ chapterId: param.chapterId, data: body, updatedById: userId })
  }

  @Delete(':chapterId')
  @MessageRes('Xóa chương thành công')
  async deleteChapter(@Param() param: GetChapterParamsDTO, @ActiveUser('userId') userId: number) {
    return this.chapterService.deleteChapter({ chapterId: param.chapterId, deletedById: userId })
  }
}
