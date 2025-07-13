import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import fs from 'fs'
import multer from 'multer'
import { MediaController } from 'src/routes/media/media.controller'
import { generateRandomFilename } from 'src/shared/helpers'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith('image') ? 'images' : 'videos'
    cb(null, `./uploads/${folder}`)
  },
  filename: (req, file, cb) => {
    const randomFilename = generateRandomFilename(file.originalname)
    cb(null, randomFilename)
  }
})

@Module({
  controllers: [MediaController],
  imports: [
    MulterModule.register({
      storage
    })
  ]
})
export class MediaModule {
  constructor() {
    if (!fs.existsSync('./uploads/images')) {
      fs.mkdirSync('./uploads/images', { recursive: true })
    }
    if (!fs.existsSync('./uploads/videos')) {
      fs.mkdirSync('./uploads/videos', { recursive: true })
    }
  }
}
