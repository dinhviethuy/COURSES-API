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
import { AzureService } from 'src/shared/services/azure.services'
import { SessionTokenPayload } from 'src/shared/types/jwt.type'

@Controller('media')
export class MediaController {
  constructor(
    private readonly sharedLessonRepository: SharedLessonRepository,
    @InjectQueue(VIDEO_QUEUE_NAME) private readonly queue: Queue,
    private readonly azureService: AzureService
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
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 * 1024 }), // 1GB
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
    try {
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
      const url = this.azureService.generateWriteSasUrl(filename)
      return { url, key, type: 'video', duration: 0 }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
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
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 * 1024 }),
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
    const ext = path.extname(safeFilename).toLowerCase().replace('.', '')
    const allowed = /(mp4|mov|avi|wmv|flv|mkv|webm)$/
    if (!allowed.test(ext)) {
      throw new BadRequestException('Định dạng video không hợp lệ')
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

  @Get('static/videos-azure/:filename')
  async stream(
    @Param('filename') rawFilename: string,
    @Headers() headers: Record<string, string | undefined>,
    @Res() res: Response,
    @ActiveUser() user: SessionTokenPayload
  ) {
    try {
      await this.sharedLessonRepository.checkCanAccessLesson({
        key: rawFilename.split('.')[0],
        where: { userId: user.userId },
        roleId: user.roleId
      })
      const input = decodeURIComponent((rawFilename || '').trim())
      if (!input) throw new BadRequestException('Missing filename')
      if (input.includes('/')) throw new BadRequestException('Invalid filename')

      const blobName = input.includes('.') ? input : `${input}.mp4`

      const baseKey = blobName.replace(/\.[^.]+$/, '')
      await this.sharedLessonRepository.checkCanAccessLesson({
        key: baseKey,
        where: { userId: user.userId },
        roleId: user.roleId
      })

      // lấy metadata blob
      const props = await this.azureService.getProps(blobName)
      const fileSize = Number(props.contentLength ?? 0)
      const contentType = props.contentType || 'video/mp4'

      const rangeHeader = headers.range
      if (!rangeHeader) {
        // const dl = await this.azureService.downloadRange(blobName, 0)
        // res.set({
        //   'Content-Type': contentType,
        //   'Content-Length': fileSize,
        //   'Accept-Ranges': 'bytes',
        //   'Cache-Control': 'no-store',
        //   'Content-Disposition': `inline; filename="${encodeURIComponent(blobName)}"`
        // })
        // dl.readableStreamBody!.pipe(res)
        // return
        return res.json({
          message: 'Không có quyền truy cập',
          error: 'Forbidden',
          statusCode: 403
        })
      }

      const m = /bytes=(\d+)-(\d+)?/.exec(rangeHeader)
      let start = m ? parseInt(m[1], 10) : 0
      let end = m && m[2] ? parseInt(m[2], 10) : fileSize - 1
      if (Number.isNaN(start)) start = 0
      if (Number.isNaN(end) || end >= fileSize) end = fileSize - 1
      if (start < 0 || start >= fileSize) {
        res
          .status(416)
          .set({ 'Content-Range': `bytes */${fileSize}`, 'Accept-Ranges': 'bytes' })
          .end()
        return
      }

      const chunkSize = end - start + 1
      const dl = await this.azureService.downloadRange(blobName, start, chunkSize)
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Content-Disposition': `inline; filename="${encodeURIComponent(blobName)}"`,
        Pragma: 'no-cache',
        Expires: '0'
      })
      dl.readableStreamBody!.pipe(res)
    } catch (error) {
      console.error('error', error)
      return res.json({
        message: 'Lỗi',
        error: error.message,
        statusCode: 500
      })
    }
  }

  @Post('videos/upload-success')
  @MessageRes('Đã bắt đầu xử lý video')
  async uploadVideoSuccess(@Body('userId') userId: number, @Body('key') key: string) {
    await this.queue
      .add(
        PROBE_DURATION_JOB_NAME,
        { key, userId },
        {
          jobId: key,
          removeOnComplete: true,
          removeOnFail: true
        }
      )
      .catch()
    return true
  }
}
