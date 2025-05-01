import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AppException } from '../exceptions';
import { Response } from 'express';
import { MakeResponse } from '../utils/response';

@Catch(AppException)
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: AppException, host: ArgumentsHost) {
    // 捕获自定义错误，以40000-49999的错误码为客户端错误，以50000-59999的错误码为服务器错误
    this.logger.error(exception.stack);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.code > 40000 && exception.code < 50000 ? 400 : 500;
    response.status(statusCode).json(MakeResponse.error(exception.code, exception.message));
  }
}

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BadRequestExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    // 捕获BadRequestException，以400的错误码为客户端错误，1004为错误码
    this.logger.error(exception.stack);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(400).json(MakeResponse.error(1004, exception.message));
  }
}

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnauthorizedExceptionFilter.name);

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    // 捕获UnauthorizedException，以401的错误码为客户端错误，1003为错误码
    this.logger.error(exception.stack);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(401).json(MakeResponse.error(1001, exception.message));
  }
}

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ForbiddenExceptionFilter.name);

  catch(exception: ForbiddenException, host: ArgumentsHost) {
    // 捕获ForbiddenException，以403的错误码为客户端错误，1002为错误码
    this.logger.error(exception.stack);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(403).json(MakeResponse.error(1003, exception.message));
  }
}

@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorFilter.name);
  catch(exception: Error, host: ArgumentsHost) {
    // 捕获其他错误，默认为服务器错误，1005为错误码
    this.logger.error(exception.stack);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(500).json(MakeResponse.error(1005, exception.message));
  }
}
