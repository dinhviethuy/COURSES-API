import { createZodDto } from 'nestjs-zod'
import { MessageResSchema } from '../models/reponse.model'

export class MessageResDTO extends createZodDto(MessageResSchema) {}
