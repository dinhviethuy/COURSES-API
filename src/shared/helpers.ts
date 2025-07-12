import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export const generateOTP = () => {
  return String(randomInt(0, 999999)).padStart(6, '0')
}

export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
}

export function isRequiredConnectPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2018'
}

export const generateRandomFilename = (fileName: string) => {
  const ext = path.extname(fileName)
  return `${uuidv4()}${ext}`
}

export const generateQueueJobId = (paymentId: number) => {
  return `cancel-payment-${paymentId}`
}

export const generateRoomId = (userId: number) => {
  return `userId-${userId}`
}

export const getVideoDuration = async (videoPath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(new Error(err instanceof Error ? err.message : String(err)))
        return
      }
      const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
      if (videoStream?.duration) {
        resolve(Number(videoStream.duration))
      }
      if (metadata.format.duration) {
        resolve(Number(metadata.format.duration))
      }
      reject(new Error('Không tìm thấy độ dài video'))
    })
  })
}
