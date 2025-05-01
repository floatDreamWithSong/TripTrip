import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPE, UserTypeValidator } from '../decorators/user-type.decorator';
import { JwtPayload } from '@triptrip/types';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取装饰器中的验证函数
    const validator = this.reflector.get<UserTypeValidator>(USER_TYPE, context.getHandler());

    // 如果没有设置验证函数，则默认允许访问
    if (!validator) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as JwtPayload;

    // 如果没有用户信息，则拒绝访问
    if (!user) {
      throw new UnauthorizedException('用户未登录');
    }

    // 使用验证函数检查用户类型
    const isValid = validator(user);
    if (!isValid) {
      throw new ForbiddenException('用户类型不匹配');
    }

    return true;
  }
}
