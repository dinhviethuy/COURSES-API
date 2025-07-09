import { createZodDto } from 'nestjs-zod'
import { LoginBodySchema, LoginResSchema, RegisterBodySchema, RegisterResSchema, SendOTPBodySchema } from './auth.model'

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
