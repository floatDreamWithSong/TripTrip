import { Injectable, Logger } from '@nestjs/common';
import { CosService } from '../../common/utils/cos/cos.service';
import { PrismaService } from '../../common/utils/prisma/prisma.service';
import { EmailService } from 'src/common/utils/email/email.service';
import { VerificationCodeService } from 'src/modules/user/verification-code.service';
import { EXCEPTIONS } from 'src/common/exceptions';
import { JwtUtils } from 'src/common/utils/jwt/jwt.service';
import { emailSchema, PASSAGE_STATUS, UserLogin, UserRegister } from '@triptrip/utils';
import { USER_TYPE } from '@triptrip/utils';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly cosService: CosService,
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtUtils: JwtUtils,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}
  async info(uid: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        uid: uid,
      },
      select: {
        username: true,
        avatar: true,
        userType: true,
        email: true,
        gender: true,
        registerTime: true,
        _count:{
          select:{
            Passage: true
          }
        }
      },
    });
    console.log(user)
    return {
      ...user,
      uid: uid
    }
  }
  private checkEmail(email: string) {
    this.logger.debug(`checking email: ${email}`);
    if(!emailSchema.safeParse(email).success) {
      throw EXCEPTIONS.INVALID_EMAIL;
    }
  }
  private findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }
  private generateTokenPair(uid: number, userType: number, username: string) {
    return this.jwtUtils.generateTokenPair({
      uid: uid,
      username: username,
      userType: userType,
      type: USER_TYPE.USER,
    })    
  }
  async sendVerifyCode(email: string): Promise<void> {
    // 检查邮箱格式
    this.checkEmail(email)
    // 检查邮箱是否已绑定
    const user = await this.findUserByEmail(email);
    if (user) {
      throw EXCEPTIONS.EMAIL_ALREADY_BOUND;
    }
    let code = await this.verificationCodeService.getCode(email);
    if (code) {
      throw EXCEPTIONS.VERIFY_CODE_SEND_TOO_FREQUENTLY;
    }
    // 发送验证码
    code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    await this.emailService.sendVerificationCode(email, code);
    // 缓存验证码，有效期为 5 分钟
    await this.verificationCodeService.setCode(email, code);
  }
  async login(body: UserLogin) {
    // 检查用户是否存在
    const user = await this.prismaService.user.findUnique({
      where: {
        username: body.username,
      },
    })
    if (!user) {
      throw EXCEPTIONS.USER_NOT_FOUND;
    }
    // 检查密码
    if (user.password !== body.password) {
      throw EXCEPTIONS.PASSWORD_ERROR;
    }
    // 生成 token
    return {
      ...this.generateTokenPair(user.uid, user.userType, user.username),
      info: await this.info(user.uid)
    }
  }
  async register(body: UserRegister) {
    // 检查邮箱格式
    this.checkEmail(body.email);
    // 检查邮箱是否已绑定
    const user = await this.findUserByEmail(body.email);
    if (user) {
      throw EXCEPTIONS.EMAIL_ALREADY_BOUND;
    }
    // 检查验证码
    const code = await this.verificationCodeService.getCode(body.email);

    if (code !== body.verifyCode) {
      throw EXCEPTIONS.VERIFY_CODE_ERROR;
    }
    // 创建用户
    const newUser = await this.prismaService.user.create({
      data: {
        email: body.email,
        password: body.password,
        avatar: '',
        username: body.username 
      },
    });
    // 生成 token
    return {
      ...this.generateTokenPair(newUser.uid, newUser.userType, newUser.username),
      info: await this.info(newUser.uid)
    }
  }
}
