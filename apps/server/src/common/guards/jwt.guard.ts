import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { META_IS_PUBLIC } from '../decorators/public.decorator';
import { JwtUtils } from '../utils/jwt/jwt.service';
import { META_IS_FORCE_IDENTITY } from '../decorators/forceIdentity.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtUtils: JwtUtils,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否标记为公开接口
    const isPublic = this.reflector.get<boolean>(META_IS_PUBLIC, context.getHandler());
    const isForceIdentity = this.reflector.get<boolean>(META_IS_FORCE_IDENTITY, context.getHandler())
    // 如果是公开且不需要身份信息
    if (isPublic && !isForceIdentity) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    if(request.method === 'OPTIONS') return true;
    const response = context.switchToHttp().getResponse<Response>();
    const accessToken = request.headers.authorization;
    const refreshToken = request.headers['x-refresh-token'] as string;
    // 如果是公开且需要身份信息，并且没有token
    if(isPublic && isForceIdentity && !accessToken){
      return true
    }
    // 如果是公开且需要身份信息，有token，或者不可公开，进行验证
    if (!accessToken) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      // 尝试验证访问令牌
      const payload = this.jwtUtils.verifyAccessToken(accessToken);
      request['user'] = payload;
      return true;
    } catch (err) {
      if (!refreshToken) {
        this.logger.error('JWT verification failed:', err);
        throw new UnauthorizedException('Invalid access token');
      }
      // 如果访问令牌无效，且提供了刷新令牌，尝试刷新令牌
      try {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
          this.jwtUtils.refreshTokens(refreshToken);

        // 在响应头中设置新的令牌
        response.setHeader('X-Access-Token', newAccessToken);
        response.setHeader('Access-Control-Expose-Headers', 'X-Access-Token');

        // 使用新的访问令牌验证用户
        const payload = this.jwtUtils.verifyAccessToken(newAccessToken);
        request['user'] = payload;
        return true;
      } catch (refreshErr) {
        this.logger.error('Token refresh failed:', refreshErr);
        throw new UnauthorizedException('Invalid refresh token');
      }

    }
  }
}
