import {
  Controller,
  FileTypeValidator,
  Get,
  Headers,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import fs, { createReadStream, statSync } from 'fs'
import path from 'path'
import { envConfig } from 'src/shared/config'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { ParseFilePipeWithUnlink } from 'src/shared/pipes/parse-file-pipe-with-unlink.pipe'

@Controller('media')
export class MediaController {
  @Post('images/upload')
  @MessageRes('Tải ảnh lên thành công')
  @UseInterceptors(FilesInterceptor('files', 2))
  uploadImages(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/, skipMagicNumbersValidation: true })
        ]
      })
    )
    files: Array<Express.Multer.File>
  ) {
    return files.map((image) => {
      const key = image.filename.split('.')[0]
      const url = `${envConfig.URL_ENDPOINT}/media/static/images/${image.filename}`
      return {
        url,
        key,
        type: 'image'
      }
    })
  }

  @Post('videos/upload')
  @MessageRes('Tải video lên thành công')
  @UseInterceptors(FilesInterceptor('files', 1))
  uploadVideos(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }), // 1GB
          new FileTypeValidator({ fileType: /(mp4|mov|avi|wmv|flv|mkv|webm)$/, skipMagicNumbersValidation: true })
        ]
      })
    )
    files: Array<Express.Multer.File>
  ) {
    return files.map((video) => {
      const key = video.filename.split('.')[0]
      const url = `${envConfig.URL_ENDPOINT}/media/static/videos/${video.filename}`
      return {
        url,
        key,
        type: 'video'
      }
    })
  }

  @Get('static/images/:filename')
  @IsPublic()
  getStaticFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = path.resolve(`./uploads/images/${filename}`)
    return res.sendFile(file)
  }

  @Get('static/videos/:filename')
  getStaticVideoFile(@Param('filename') filename: string, @Res() res: Response, @Headers() headers) {
    const safeFilename = path.basename(filename)
    const videoPath = path.resolve(`./uploads/videos/${safeFilename}`)
    if (!fs.existsSync(videoPath)) {
      const notFound = new NotFoundException('Video not found')
      return res.status(notFound.getStatus()).json(notFound)
    }
    res.setHeader('Content-Type', 'video/mp4')
    res.setHeader('Accept-Ranges', 'bytes')

    const { size } = statSync(videoPath)
    const videoRange = headers.range
    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1
      const chunkSize = end - start + 1

      const readStreamfile = createReadStream(videoPath, {
        start,
        end,
        highWaterMark: 128 * 1024 // 256KB
      })

      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunkSize
      }
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head)
      readStreamfile.pipe(res)
    } else {
      res.writeHead(HttpStatus.OK, {
        'Content-Length': size
      })
      createReadStream(videoPath).pipe(res)
    }
  }
}
