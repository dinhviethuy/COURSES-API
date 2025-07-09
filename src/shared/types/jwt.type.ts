export interface SessionTokenPayloadCreate {
  userId: number
  roleId: number
  roleName: string
}

export interface SessionTokenPayload extends SessionTokenPayloadCreate {
  iat: number
  exp: number
}
