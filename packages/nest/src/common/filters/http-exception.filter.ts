import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status
      = exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    let message: string | string[] = 'Internal Server Error'
    if (exception instanceof HttpException) {
      const res = exception.getResponse()
      message = typeof res === 'string' ? res : (res as any).message
    }

    response.status(status).json({
      status,
      data: null,
      message,
    })
  }
}
