import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { v4 as uuidv4 } from 'uuid'
import { envConfig } from '../config'
import { SessionTokenPayload, SessionTokenPayloadCreate } from '../types/jwt.type'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signSessionToken(payload: SessionTokenPayloadCreate): string {
    return this.jwtService.sign(
      {
        ...payload,
        uuid: uuidv4()
      },
      {
        secret: envConfig.SESSION_TOKEN_SECRET,
        expiresIn: envConfig.SESSION_TOKEN_EXPIRES_IN
      }
    )
  }

  verifySessionToken(token: string): Promise<SessionTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.SESSION_TOKEN_SECRET
    })
  }
}
