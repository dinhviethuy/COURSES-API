import { InjectQueue } from '@nestjs/bullmq'
import {
  BadRequestException,
  Body,
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
import { Queue } from 'bullmq'
import { Response } from 'express'
import fs, { createReadStream, statSync } from 'fs'
import multer from 'multer'
import path from 'path'
import { envConfig } from 'src/shared/config'
import { PROBE_DURATION_JOB_NAME, VIDEO_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { generateRandomFilename } from 'src/shared/helpers'
import { ParseFilePipeWithUnlink } from 'src/shared/pipes/parse-file-pipe-with-unlink.pipe'
import { SharedLessonRepository } from 'src/shared/repositories/shared-lesson.repo'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'

@Controller('media')
export class MediaController {
  constructor(
    private readonly sharedLessonRepository: SharedLessonRepository,
    @InjectQueue(VIDEO_QUEUE_NAME) private readonly queue: Queue
  ) {}

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
    files: Array<Express.Multer.File>,
    @ActiveUser('userId') userId: number
  ) {
    for (const video of files) {
      const key = video.filename.split('.')[0]
      this.queue
        .add(
          PROBE_DURATION_JOB_NAME,
          { path: video.path, key, userId },
          {
            jobId: key,
            removeOnComplete: true,
            removeOnFail: true
          }
        )
        .catch((e) => console.error('enqueue failed', e))
    }
    return files.map((video) => {
      const key = video.filename.split('.')[0]
      const url = `${envConfig.URL_ENDPOINT}/media/static/videos/${video.filename}`
      return { url, key, type: 'video', duration: 0 }
    })
  }

  @Post('videos/init')
  @MessageRes('Khởi tạo tải video thành công')
  initUploadVideo(@Body('originalName') originalName: string) {
    if (!originalName) {
      throw new BadRequestException('Thiếu tên file gốc')
    }
    const ext = path.extname(originalName).toLowerCase().replace('.', '')
    const allowed = /(mp4|mov|avi|wmv|flv|mkv|webm)$/
    if (!allowed.test(ext)) {
      throw new BadRequestException('Định dạng video không hợp lệ')
    }
    const filename = generateRandomFilename(originalName)
    const key = filename.split('.')[0]
    const url = `${envConfig.URL_ENDPOINT}/media/static/videos/${filename}`
    return { url, key, type: 'video', duration: 0 }
  }

  @Post('videos/upload-by-name')
  @MessageRes('Tải video (nền) lên thành công')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          const videosDir = path.resolve(process.cwd(), 'uploads', 'videos')
          cb(null, videosDir)
        },
        filename: (req, file, cb) => {
          const requested = String(
            (req.query?.filename as string) ||
              (req.headers['x-filename'] as string) ||
              (req.body?.filename as string) ||
              ''
          )
          const safe = path.basename(requested)
          const ext = path.extname(safe).toLowerCase().replace('.', '')
          const allowed = /(mp4|mov|avi|wmv|flv|mkv|webm)$/
          if (!safe || !allowed.test(ext)) {
            return cb(new Error('Tên file không hợp lệ'), safe)
          }
          cb(null, safe)
        }
      })
    })
  )
  uploadVideoByName(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(mp4|mov|avi|wmv|flv|mkv|webm)$/, skipMagicNumbersValidation: true })
        ]
      })
    )
    files: Array<Express.Multer.File>,
    @ActiveUser('userId') userId: number
  ) {
    const safeFilename = files?.[0]?.filename
    if (!safeFilename) {
      throw new BadRequestException('Thiếu tên file')
    }
    for (const video of files) {
      const key = safeFilename.split('.')[0]
      this.queue
        .add(
          PROBE_DURATION_JOB_NAME,
          { path: video.path, key, userId },
          {
            jobId: key,
            removeOnComplete: true,
            removeOnFail: true
          }
        )
        .catch((e) => console.error('enqueue failed', e))
    }
    const key = safeFilename.split('.')[0]
    const url = `${envConfig.URL_ENDPOINT}/media/static/videos/${safeFilename}`
    return [{ url, key, type: 'video', duration: 0 }]
  }

  @Get('static/images/:filename')
  @IsPublic()
  getStaticFile(@Param('filename') filename: string, @Res() res: Response) {
    const safeFilename = path.basename(filename)
    const file = path.resolve(`./uploads/images/${safeFilename}`)
    if (!fs.existsSync(file)) {
      const notFound = new NotFoundException('Không tìm thấy ảnh')
      return res.status(notFound.getStatus()).json(notFound)
    }
    return res.sendFile(file)
  }

  @Get('static/videos/:filename')
  async getStaticVideoFile(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Headers() headers,
    @ActiveUser() user: SessionTokenPayload
  ) {
    await this.sharedLessonRepository.checkCanAccessLesson({
      key: filename.split('.')[0],
      where: { userId: user.userId },
      roleId: user.roleId
    })

    const safeFilename = path.basename(filename)
    const videoPath = path.resolve(`./uploads/videos/${safeFilename}`)
    if (!fs.existsSync(videoPath)) {
      const notFound = new NotFoundException('Không tìm thấy video')
      return res.status(notFound.getStatus()).json(notFound)
    }

    const { size } = statSync(videoPath)
    const videoRange = headers.range
    if (videoRange) {
      res.setHeader('Content-Type', 'video/mp4')
      res.setHeader('Accept-Ranges', 'bytes')
      const parts = videoRange.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1
      const chunkSize = end - start + 1

      const readStreamfile = createReadStream(videoPath, {
        start,
        end,
        highWaterMark: 128 * 1024 // 128KB
      })

      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunkSize,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head)
      readStreamfile.pipe(res)
    } else {
      // throw new ForbiddenException('Không có quyền truy cập')
      return res.json({
        message: 'Không có quyền truy cập',
        error: 'Forbidden',
        statusCode: 403
      })
      // res.writeHead(HttpStatus.OK, {
      //   'Content-Length': size,
      //   'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      // })
      // createReadStream(videoPath).pipe(res)
    }
  }
}
