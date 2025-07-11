import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'
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
