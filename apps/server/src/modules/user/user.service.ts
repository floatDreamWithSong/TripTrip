import { Injectable, Logger } from '@nestjs/common';
import { CosService } from '../../common/utils/cos/cos.service';
import { PrismaService } from '../../common/utils/prisma/prisma.service';
import { EmailService } from 'src/common/utils/email/email.service';
import { VerificationCodeService } from 'src/modules/user/verification-code.service';
import { EXCEPTIONS } from 'src/common/exceptions';
import { JwtUtils } from 'src/common/utils/jwt/jwt.service';
import { emailSchema, PASSAGE_STATUS, UserLogin, UserRegister, UserUpdateEmail, UserUpdateInfo, UserUpdatePassword, UserForgetPassword } from '@triptrip/utils';
import { USER_TYPE } from '@triptrip/utils';
import { VERIFICATION_CODE_POSTFIX } from 'src/common/constants';
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
  async updateAvatar(file: Express.Multer.File, uid: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        uid: uid,
      },
    });
    if (!user) {
      throw EXCEPTIONS.USER_NOT_FOUND;
    }
    const avatarUrl = `https://${await this.cosService.uploadFile(file)}`;
    const oldAvatarUrl = user.avatar;
    await this.prismaService.user.update({
      where: {
        uid: uid,
      },
      data: {
        avatar: avatarUrl,
      },
    });
    if (oldAvatarUrl) {
      await this.cosService.deleteFileByUrl(oldAvatarUrl);
    }
    return {
      avatar: avatarUrl,
    }
  }
  async updateInfo(body: UserUpdateInfo & {uid: number}) {
    await this.prismaService.user.update({
      where: {
        uid: body.uid,
      },
      data: body,
    });
  }
  async updatePassword(body: UserUpdatePassword & {uid: number}) {
    const user = await this.prismaService.user.findUnique({
      where: {
        uid: body.uid,
      },
    });
    if (!user) {
      throw EXCEPTIONS.USER_NOT_FOUND;
    }
    if (user.password !== body.oldPassword) {
      throw EXCEPTIONS.PASSWORD_ERROR;
    }
    await this.prismaService.user.update({
      where: {
        uid: body.uid,
      },
      data: {
        password: body.newPassword,
      },
    });
  }
  async updateEmail(body: UserUpdateEmail & {uid: number}) {
    const code = await this.verificationCodeService.getCode(body.email, VERIFICATION_CODE_POSTFIX.USER_UPDATE_EMAIL);
    if (code !== body.verifyCode) {
      throw EXCEPTIONS.VERIFY_CODE_ERROR;
    }
    await this.prismaService.user.update({
      where: {
        uid: body.uid,
      },
      data: {
        email: body.email,
      },
    });
    await this.verificationCodeService.deleteCode(body.email, VERIFICATION_CODE_POSTFIX.USER_UPDATE_EMAIL);
  }
  async forgetPassword(body: UserForgetPassword & {uid: number}) {
    const code = await this.verificationCodeService.getCode(body.email, VERIFICATION_CODE_POSTFIX.USER_FORGET_PASSWORD);
    if (code !== body.verifyCode) {
      throw EXCEPTIONS.VERIFY_CODE_ERROR;
    }
    await this.prismaService.user.update({
      where: {
        uid: body.uid,
      },
      data: {
        password: body.password,
      },
    });
    await this.verificationCodeService.deleteCode(body.email, VERIFICATION_CODE_POSTFIX.USER_FORGET_PASSWORD);
  }
  privateInfo(uid: number) {
    const user = this.prismaService.user.findUnique({
      where: {
        uid: uid,
      },
      include:{
        _count: {
          select: {
            passages: {
              where: {
                status: PASSAGE_STATUS.APPROVED,
              }
            },
            followers: true,
            following: true,
          }
        }
      },
      omit: {
        password: true,
      }
    })
    return user;
  }
  /**
   *  用户公开信息
   * @param uid 
   * @returns 
   */
  async publicInfo(uid: number) {
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
            passages: {
              where: {
                status: PASSAGE_STATUS.APPROVED,
              }
            },
            followers: true,
            following: true,
          }
        }
      },
    });
    this.logger.debug('查询用户公开信息:\n',user)
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
  /**
   *  发送验证码
   * @param email 
   */
  async sendVerifyCode(email: string, postfixType: string): Promise<void> {
    // 检查邮箱格式
    this.checkEmail(email)
    // 检查邮箱是否已绑定
    const user = await this.findUserByEmail(email);
    if (user) {
      throw EXCEPTIONS.EMAIL_ALREADY_BOUND;
    }
    let code = await this.verificationCodeService.getCode(email, postfixType);
    if (code) {
      throw EXCEPTIONS.VERIFY_CODE_SEND_TOO_FREQUENTLY;
    }
    // 发送验证码
    code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    await this.emailService.sendVerificationCode(email, code);
    // 缓存验证码，有效期为 5 分钟
    await this.verificationCodeService.setCode(email, code, postfixType);
  }

  /**
   *  用户登录
   * @param body 
   * @returns 
   */
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
      info: await this.publicInfo(user.uid)
    }
  }
  /**
   *  用户注册
   * @param body 
   * @returns 
   */
  async register(body: UserRegister) {
    // 检查邮箱格式
    this.checkEmail(body.email);
    // 检查邮箱是否已绑定
    const user = await this.findUserByEmail(body.email);
    if (user) {
      throw EXCEPTIONS.EMAIL_ALREADY_BOUND;
    }
    // 检查验证码
    const code = await this.verificationCodeService.getCode(body.email, VERIFICATION_CODE_POSTFIX.USER_REGISTER);

    if (code !== body.verifyCode) {
      throw EXCEPTIONS.VERIFY_CODE_ERROR;
    }
    // 创建用户
    const newUser = await this.prismaService.user.create({
      data: {
        email: body.email,
        password: body.password,
        username: body.username
      },
    });
    // 生成 token
    return {
      ...this.generateTokenPair(newUser.uid, newUser.userType, newUser.username),
      info: await this.publicInfo(newUser.uid)
    }
  }
}
