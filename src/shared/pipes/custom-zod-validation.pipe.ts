import { UnprocessableEntityException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

const CustomZodValidationPipe = createZodValidationPipe({
  createValidationException: (e: ZodError) => {
    return new UnprocessableEntityException(
      e.errors.map((error) => {
        return {
          ...error,
          path: error.path.join('.')
        }
      })
    )
  }
})

export default CustomZodValidationPipe
