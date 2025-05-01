import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtUtils } from '../utils/jwt/jwt.service';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtUtils: JwtUtils,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否标记为公开接口
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    try {
      const token = authHeader;
      const payload = this.jwtUtils.verify(token);
      request['user'] = payload;
      return true;
    } catch (err) {
      this.logger.error('JWT verification failed:', err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
