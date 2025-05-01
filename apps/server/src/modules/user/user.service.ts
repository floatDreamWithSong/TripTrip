import { Injectable, Logger } from '@nestjs/common';
import { CosService } from '../../common/utils/cos/cos.service';
import { PrismaService } from '../../common/utils/prisma/prisma.service';
import { JwtPayload } from '@triptrip/types';
import { EmailService } from 'src/common/utils/email/email.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { EXCEPTIONS } from 'src/common/exceptions';
import { JwtUtils } from 'src/common/utils/jwt/jwt.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly cosService: CosService,
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtUtils: JwtUtils,
    @InjectRedis() private readonly redisService: Redis,
  ) {}
  async changeAvatar(file: Express.Multer.File, user: JwtPayload): Promise<string> {
    const res = await this.cosService.uploadFile(file);
    // 删除旧的头像
    const _user = await this.prismaService.user.findUnique({
      where: {
        openId: user.openid,
      },
      select: {
        avatar: true,
      },
    });
    await this.prismaService.user.update({
      where: {
        openId: user.openid,
      },
      data: {
        avatar: res,
      },
    });
    if (_user?.avatar) {
      await this.cosService.deleteFile(_user.avatar.split('myqcloud.com/')[1]);
    }
    return res;
  }
  private validateEmail(email: string) {
    if (email === '956968770@qq.com') return true;
    const emailRegex = /^\d{11}@stu\.ecnu\.edu\.cn$/;
    return emailRegex.test(email);
  }
  async sendVerifyCode(email: string, openId: string): Promise<void> {
    // 检查邮箱格式
    if (!this.validateEmail(email)) {
      throw EXCEPTIONS.EMAIL_AUTH_ERROR;
    }
    // 检查用户是否已经绑定邮箱
    const user = await this.prismaService.user.findUnique({
      where: {
        openId: openId,
      },
    });
    if (user?.email) {
      throw EXCEPTIONS.EMAIL_ALREADY_BOUND;
    }
    let code = await this.redisService.get(email);
    if (code) {
      throw EXCEPTIONS.VERIFY_CODE_SEND_TOO_FREQUENTLY;
    }
    // 发送验证码
    code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    await this.emailService.sendVerificationCode(email, code);
    // 缓存验证码，有效期为 5 分钟
    await this.redisService.set(email, code, 'EX', 5 * 60);
  }
  async verifyCode(email: string, code: string, openId: string) {
    const _code = await this.redisService.get(email);
    if (_code != code) {
      throw EXCEPTIONS.VERIFY_CODE_ERROR;
    }
    // 绑定成功，删除验证码
    await this.redisService.del(email);
    // 更新用户邮箱
    await this.prismaService.user.update({
      where: {
        openId: openId,
        userType: 0,
      },
      data: {
        email: email,
        userType: 1,
      },
    });
    // 签发新的 JWT
    const jwtToken = this.jwtUtils.sign({
      openid: openId,
      userType: 1,
      iat: Math.floor(Date.now() / 1000),
    });
    this.logger.log(`用户${openId}绑定邮箱成功, jwtToken: ${jwtToken}`);
    return jwtToken;
  }
}
