import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Configurations } from 'src/common/config';
import { lastValueFrom } from 'rxjs';
import { WechatEncryptedDataDto, WeChatOpenidSessionKeySchema } from 'src/validators/wechat';
import { WXBizDataCrypt } from 'src/common/utils/decrypt';
import { EXCEPTIONS } from 'src/common/exceptions';
import { PrismaService } from '../../common/utils/prisma/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { JwtUtils } from 'src/common/utils/jwt/jwt.service';

@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly jwtUtils: JwtUtils,
    @InjectRedis() private readonly redisService: Redis,
  ) {}

  private async setSessionKeyByOpenid(openid: string, sessionKey: string) {
    // Store session key with 2 hour expiration
    await this.redisService.set(`wx:session:${openid}`, sessionKey, 'EX', 2 * 60 * 60);
  }

  private async getSessionKeyByOpenid(openid: string): Promise<string | null> {
    return await this.redisService.get(`wx:session:${openid}`);
  }

  async loginByCode(code: string) {
    const endPointUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${Configurations.WX_APPID}&secret=${Configurations.WX_SECRET}&js_code=${code}&grant_type=authorization_code`;
    this.logger.log('微信登录请求地址:' + endPointUrl);
    const response = await lastValueFrom(
      this.httpService.get<{
        openid: string;
        session_key: string;
      }>(endPointUrl),
    );
    const result = WeChatOpenidSessionKeySchema.safeParse(response.data);
    if (!result.success) {
      this.logger.error('微信登录返回数据错误:' + JSON.stringify(response.data));
      throw EXCEPTIONS.WX_LOGIN_DATA_ERROR;
    }
    this.logger.log(`微信登录返回数据:${JSON.stringify(response.data)}`);
    // 如果是老用户
    const user = await this.prisma.user.findUnique({
      where: {
        openId: response.data.openid,
      },
    });
    if (user) {
      const jwtToken = this.jwtUtils.sign({
        openid: user.openId,
        userType: user.userType,
        iat: Math.floor(Date.now() / 1000),
      });
      this.logger.log(`已存在的用户进行登录, jwtToken: ${jwtToken}`);
      return {
        token: jwtToken,
        registered: true,
        info: {
          gender: user.gender,
          username: user.username,
          avatar: user.avatar,
          userType: user.userType,
          email: user.email,
          phone: user.phone.slice(0, 3) + '****' + user.phone.slice(-4),
          privateId: user.privateId,
          registerTime: user.registerTime,
        },
      };
    }
    // 使用 RedisService 存储 session_key
    await this.setSessionKeyByOpenid(response.data.openid, response.data.session_key);

    const jwtToken = this.jwtUtils.sign({
      openid: response.data.openid,
      userType: 0,
      iat: Math.floor(Date.now() / 1000),
    });
    this.logger.log(`新用户正在等待绑定, jwtToken: ${jwtToken}`);
    return {
      token: jwtToken,
      registered: false,
      info: null,
    };
  }

  async registerPhone(data: WechatEncryptedDataDto, openid: string) {
    this.logger.log(`微信注册手机号:${JSON.stringify(data)}`);
    const sessionKey = await this.getSessionKeyByOpenid(openid);
    if (!sessionKey) throw EXCEPTIONS.WX_SESSION_KEY_NOT_FOUND;
    this.logger.log('sessionKey: ' + sessionKey);
    const phoneData = new WXBizDataCrypt(Configurations.WX_APPID, sessionKey).decryptData<{
      phoneNumber: string;
      purePhoneNumber: string;
      countryCode: string;
    }>(data.encryptedData, data.iv);
    this.logger.log('phoneData: ' + JSON.stringify(phoneData));

    return await this.prisma.user
      .create({
        data: {
          openId: openid,
          phone: phoneData.phoneNumber,
          username: `用户${Math.random().toString(36).slice(2, 8)}`, // 生成随机用户名
          avatar: '', // 默认空头像
          gender: 0, // 默认未知性别
          userType: 0, // 默认游客
        },
      })
      .then((user) => {
        return {
          gender: user.gender,
          username: user.username,
          avatar: user.avatar,
          userType: user.userType,
          email: user.email,
          phone: phoneData.phoneNumber.slice(0, 3) + '****' + phoneData.phoneNumber.slice(-4),
          privateId: user.privateId,
          registerTime: user.registerTime,
        };
      })
      .catch((error) => {
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
          // 唯一性约束冲突
          this.logger.error(
            `用户注册失败：openId ${openid} 或手机号 ${phoneData.phoneNumber} 已存在`,
          );
          throw EXCEPTIONS.WX_ALREADY_REGISTERED;
        }
        throw error;
      });
  }
}
