import { createZodDto } from 'nestjs-zod'
import { EmptyBodySchema } from '../models/request.body'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
