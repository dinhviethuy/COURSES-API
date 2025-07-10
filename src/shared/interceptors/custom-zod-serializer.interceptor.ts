import { CallHandler, ExecutionContext, Injectable, StreamableFile } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { validate, ZodSerializationException, ZodSerializerInterceptor } from 'nestjs-zod'
import { map, Observable } from 'rxjs'
import { MessageKey } from '../decorators/message.decorator'
import { ZodError } from 'zod'

const createZodSerializationException = (error: ZodError) => {
  return new ZodSerializationException(error)
}

@Injectable()
export class CustomZodSerializerInterceptor extends ZodSerializerInterceptor {
  constructor(protected readonly reflector: Reflector) {
    super(reflector)
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseSchema = this.getContextResponseSchema(context)
    const statusCode = context.switchToHttp().getResponse().statusCode
    const message = this.reflector.get<string | undefined>(MessageKey, context.getHandler()) ?? ''

    return next.handle().pipe(
      map((res) => {
        if (!responseSchema || typeof res !== 'object' || res instanceof StreamableFile) {
          return {
            data: res,
            statusCode,
            message
          }
        }

        const validatedData = Array.isArray(res)
          ? res.map((item) => validate(item, responseSchema, createZodSerializationException))
          : validate(res, responseSchema, createZodSerializationException)

        return {
          data: validatedData,
          statusCode,
          message
        }
      })
    )
  }
}
