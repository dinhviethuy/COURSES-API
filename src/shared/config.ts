import { Logger } from '@nestjs/common'
import { config } from 'dotenv'
import fs from 'fs'
import z from 'zod'

config({
  path: '.env'
})

const logger = new Logger('Config')

if (!fs.existsSync('.env')) {
  logger.error('Using .env file to supply config environment variables')
  process.exit(1)
}

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SESSION_TOKEN_SECRET: z.string(),
  SESSION_TOKEN_EXPIRES_IN: z.string(),
  PAYMENT_API_KEY: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string(),
  OTP_EXPIRES_IN: z.string()
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  logger.error('Invalid environment variables')
  logger.error(configServer.error)
  process.exit(1)
}

export const envConfig = configServer.data
