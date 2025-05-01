import { BadRequestException } from '@nestjs/common';

export class AppException extends Error {
  constructor(
    public readonly code: number,
    public readonly message: string,
    public readonly details?: any,
  ) {
    super(message);
  }
}

export class ClientException extends AppException {
  static clientExceptionIterator = 1;

  constructor(message: string, overwritePrefix: boolean = true, details?: any) {
    if (overwritePrefix) {
      super(40000 + ClientException.clientExceptionIterator++, message, details);
    } else {
      super(40000 + ClientException.clientExceptionIterator++, `客户端错误: ${message}`, details);
    }
  }
}

export class NoEffectRequestException extends ClientException {
  constructor(message: string, overwritePrefix: boolean = true, details?: any) {
    if (overwritePrefix) {
      super(message, overwritePrefix, details);
    } else {
      super(`无效果请求: ${message}`, overwritePrefix, details);
    }
  }
}

export class ServerException extends AppException {
  static serverExceptionIterator = 1;

  constructor(message: string, overwritePrefix: boolean = true, details?: any) {
    if (overwritePrefix) {
      super(50000 + ServerException.serverExceptionIterator++, message, details);
    } else {
      super(50000 + ServerException.serverExceptionIterator++, `服务器错误: ${message}`, details);
    }
  }
}

export class WXAuthException extends NoEffectRequestException {
  constructor(message: string, details?: any) {
    super(`微信认证错误: ${message}`, true, details);
  }
}

export class PrivateAuthException extends AppException {
  constructor(message: string, details?: any) {
    super(40004, `认证错误: ${message}`, details);
  }
}

export const EXCEPTIONS = {
  WX_ILLEGAL_BUFFER: new BadRequestException('非法的buffer'),
  WX_APPID_MISMATCH: new ServerException('appid不匹配'),
  WX_SESSION_KEY_NOT_FOUND: new NoEffectRequestException('session_key不存在'),
  WX_LOGIN_DATA_ERROR: new WXAuthException('登录返回数据错误：code无效'),
  WX_ALREADY_REGISTERED: new WXAuthException('用户已被注册'),
  VERIFY_CODE_ERROR: new PrivateAuthException('验证码错误'),
  EMAIL_ALREADY_BOUND: new PrivateAuthException('邮箱已被绑定'),
  EMAIL_AUTH_ERROR: new PrivateAuthException('不是被认证的邮箱类型'),
  VERIFY_CODE_SEND_TOO_FREQUENTLY: new PrivateAuthException('验证码发送太频繁'),
};
