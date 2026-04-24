import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Une erreur est survenue',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(typeof exceptionResponse === 'object' ? exceptionResponse : { message: exception.message }),
      };
    } else {
      responseBody.message = 'Erreur interne du serveur';
    }

    this.logger.error(
      `[${request.method}] ${request.url} - ${status} : ${responseBody.message || 'Erreur'}`,
      exception instanceof Error ? exception.stack : ''
    );

    response.status(status).json(responseBody);
  }
}