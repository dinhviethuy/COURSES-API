import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { Server, ServerOptions, Socket } from 'socket.io'
import { envConfig } from 'src/shared/config'
import { generateRoomId } from 'src/shared/helpers'
import { TokenService } from 'src/shared/services/token.service'

export class WebsocketAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>
  private readonly tokenService: TokenService
  constructor(app: INestApplicationContext) {
    super(app)
    this.tokenService = app.get(TokenService)
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: envConfig.REDIS_URL })
    const subClient = pubClient.duplicate()
    await Promise.all([pubClient.connect(), subClient.connect()])
    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const socket = super.createIOServer(port, {
      ...options,
      cors: {
        origin: envConfig.CLIENT_URL,
        credentials: true
      }
    })
    socket.adapter(this.adapterConstructor)

    socket.use((socket, next) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {})
    })

    socket.of(/.*/).use((socket, next) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {})
    })

    return socket
  }

  async authMiddleware(socket: Socket, next: (err?: any) => void) {
    const cookie = socket.handshake.headers.cookie
    if (!cookie) {
      next(new Error('Thiếu sessionToken'))
      return
    }
    const sessionToken = cookie.split('=')[1]
    if (!sessionToken) {
      return next(new Error('Thiếu sessionToken'))
    }

    try {
      const { userId } = await this.tokenService.verifySessionToken(sessionToken)
      await socket.join(generateRoomId(userId))
      next()
    } catch (error) {
      return next(error)
    }
  }
}
