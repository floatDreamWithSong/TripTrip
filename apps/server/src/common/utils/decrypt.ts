import * as crypto from 'crypto';
import { WechatDecryptDataLike } from '@triptrip/types';
import { EXCEPTIONS } from '../exceptions';
import { Logger } from '@nestjs/common';

export class WXBizDataCrypt {
  private readonly logger = new Logger(WXBizDataCrypt.name);
  private appId: string;
  private sessionKey: string;

  constructor(appId: string, sessionKey: string) {
    this.appId = appId;
    this.sessionKey = sessionKey;
  }

  decryptData<T, R extends T & WechatDecryptDataLike = T & WechatDecryptDataLike>(
    encryptedData: string,
    iv: string,
  ): R {
    // base64 decode
    const sessionKeyBuffer = Buffer.from(this.sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      let decoded = decipher.update(encryptedDataBuffer, undefined, 'utf8');
      decoded += decipher.final('utf8');

      const decodedData = JSON.parse(decoded) as R;
      // 校验 appId
      if (decodedData.watermark.appid !== this.appId) {
        this.logger.error(`AppID不匹配: 期望 ${this.appId}, 实际 ${decodedData.watermark.appid}`);
        throw EXCEPTIONS.WX_APPID_MISMATCH;
      }
      return decodedData;
    } catch (err) {
      this.logger.error('微信数据解密失败', err);
      throw EXCEPTIONS.WX_ILLEGAL_BUFFER;
    }
  }
}
