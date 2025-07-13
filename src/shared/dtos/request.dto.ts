import { createZodDto } from 'nestjs-zod'
import { EmptyBodySchema } from 'src/shared/models/request.body'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
