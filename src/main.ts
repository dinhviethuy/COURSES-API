import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from 'src/app.module'
import { envConfig } from 'src/shared/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: envConfig.CLIENT_URL,
    credentials: true,
  })
  app.use(cookieParser())
  await app.listen(envConfig.PORT)
}
bootstrap()
