import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@triptrip/utils';
import { Request } from 'express';

export const User = createParamDecorator((data: keyof JwtPayload, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request['user'] as JwtPayload; // JWT解析后的用户数据
  if (!user) {
    return null; // 未登录，返回null
  }
  if (!data) {
    return user; // 未指定属性，返回整个用户数据
  }
  return user[data]; // 返回指定属性的值
});
