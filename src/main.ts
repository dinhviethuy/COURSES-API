import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from 'src/app.module'
import { envConfig } from 'src/shared/config'
import { WebsocketAdapter } from 'src/websockets/websocket.adapter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: 'http://localhost:5173', // Allow requests from this domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these methods
    allowedHeaders: 'Content-Type, Authorization', // Allow these headers
    credentials: true // Allow credentials (cookies, HTTP authentication)
  })

  const websocketAdapter = new WebsocketAdapter(app)
  await websocketAdapter.connectToRedis()
  app.useWebSocketAdapter(websocketAdapter)
  app.use(cookieParser())
  await app.listen(envConfig.PORT)
}
bootstrap()
