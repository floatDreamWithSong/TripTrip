import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  AppExceptionFilter,
  BadRequestExceptionFilter,
  ErrorFilter,
  ForbiddenExceptionFilter,
  UnauthorizedExceptionFilter,
} from './common/filters/app-exception.filter';
import { LoggerService } from './common/utils/logger/logger.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
  });
  app
    .useGlobalFilters(new ErrorFilter())
    .useGlobalFilters(new AppExceptionFilter())
    .useGlobalFilters(new UnauthorizedExceptionFilter())
    .useGlobalFilters(new BadRequestExceptionFilter())
    .useGlobalFilters(new ForbiddenExceptionFilter());

  app.useGlobalInterceptors(new TransformInterceptor());
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log('Server is running on port', port);
}
void bootstrap();
