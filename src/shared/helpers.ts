import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { randomInt } from 'crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'path'
import { CouponType } from 'src/shared/constants/counpon.constant'
import { v4 as uuidv4 } from 'uuid'

const execFileAsync = promisify(execFile)

export function isUniqueConstraintPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
}

export const generateOTP = () => {
  return String(randomInt(0, 999999)).padStart(6, '0')
}

export function isForeignKeyConstraintPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2003'
}

export function isRequiredConnectPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2018'
}

export const generateRandomFilename = (fileName: string) => {
  const ext = path.extname(fileName)
  return `${uuidv4()}${ext}`
}

export const generateQueueJobId = (orderId: number) => {
  return `cancel-payment-${orderId}`
}

export const generateRoomId = (userId: number) => {
  return `userId-${userId}`
}

// export const getVideoDuration = async (videoPath: string): Promise<number> => {
//   return new Promise((resolve, reject) => {
//     ffmpeg.ffprobe(videoPath, (err, metadata) => {
//       if (err) {
//         reject(new Error(err instanceof Error ? err.message : String(err)))
//         return
//       }
//       const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
//       if (videoStream?.duration) {
//         resolve(Number(videoStream.duration))
//       }
//       if (metadata.format.duration) {
//         resolve(Number(metadata.format.duration))
//       }
//       reject(new Error('Không tìm thấy độ dài video'))
//     })
//   })
// }

export async function getVideoDuration(videoPath: string): Promise<number> {
  const { stdout } = await execFileAsync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', videoPath],
    { windowsHide: true }
  )
  return parseFloat(stdout)
}

export const getTotalPrice = ({
  coursePrice,
  courseDiscount,
  couponDiscount: couponDiscountFromParam,
  couponType: couponTypeFromParam
}: {
  coursePrice: number | null
  courseDiscount: number | null
  couponDiscount: number | null
  couponType: CouponType | null
}) => {
  const price = coursePrice ?? 0
  const discount = courseDiscount ?? 0
  const couponDiscount = couponDiscountFromParam ?? 0
  const couponType = couponTypeFromParam ?? CouponType.PERCENT
  let totalPrice = price * (1 - discount / 100)
  if (couponType === CouponType.PERCENT) {
    totalPrice = totalPrice * (1 - couponDiscount / 100)
  } else {
    totalPrice = totalPrice - couponDiscount
  }
  if (totalPrice < 0) {
    totalPrice = 0
  }
  return totalPrice
}

export const escapeMarkdownV2 = (text: string) => text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')

export function encodeRFC5987ValueChars(str: string) {
  return encodeURIComponent(str).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A')
}
