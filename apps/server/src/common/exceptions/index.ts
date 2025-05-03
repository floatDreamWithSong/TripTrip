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

export class AuthException extends AppException {
  constructor(message: string, details?: any) {
    super(40004, `认证错误: ${message}`, details);
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

export class UploadServerException extends ClientException {
  constructor(message: string, details?: any) {
    super(`上传参数错误: ${message}`, false, details);
  }
}

export class PassageException extends ClientException {
  constructor(message: string, details?: any) {
    super(`游记错误: ${message}`, false, details);
  }
}

export const EXCEPTIONS = {
  ILLEGAL_BUFFER: new BadRequestException('非法的buffer'),
  SESSION_KEY_NOT_FOUND: new NoEffectRequestException('session_key不存在'),
  ALREADY_REGISTERED: new AuthException('用户已注册'),
  VERIFY_CODE_ERROR: new AuthException('验证码错误'),
  EMAIL_ALREADY_BOUND: new AuthException('邮箱已被绑定'),
  USER_NOT_FOUND: new AuthException('用户不存在'),
  PASSWORD_ERROR: new AuthException('密码错误'),
  USERNAME_ALREADY_EXISTS: new AuthException('用户名已存在'),
  EMAIL_ALREADY_EXISTS: new AuthException('邮箱已存在'),
  INVALID_EMAIL: new AuthException('邮箱格式错误'),
  VERIFY_CODE_SEND_TOO_FREQUENTLY: new AuthException('验证码发送太频繁'),
  INVALID_IMAGE_TYPE: new UploadServerException('只允许上传图片文件(jpeg,png,gif,webp)'),
  IMAGE_SIZE_EXCEEDED: new UploadServerException('图片大小不能超过2M'),
  INVALID_VIDEO_TYPE: new UploadServerException('只允许上传视频文件(mp4,webm,ogg,avi)'),
  VIDEO_SIZE_EXCEEDED: new UploadServerException('视频大小不能超过50M'),
  PASSAGE_NOT_FOUND: new PassageException('游记不存在'),
  PASSAGE_DELETE_FAILED: new PassageException('游记删除失败'),
};
