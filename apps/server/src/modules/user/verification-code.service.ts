import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { EXCEPTIONS } from 'src/common/exceptions';
@Injectable()
export class VerificationCodeService {
  private readonly prefix = 'verification_code:';
  private readonly codeExpire = 5 * 60; // 5分钟

  constructor(@InjectRedis() private readonly redisService: Redis) { }

  async setCode(email: string, code: string, postfix: string): Promise<void> {
    const key = this.prefix + email + postfix;
    await this.redisService.set(key, code, 'EX', this.codeExpire);
  }

  async getCode(email: string, postfix: string ): Promise<string | null> {
    const key = this.prefix + email + postfix;
    return await this.redisService.get(key);
  }

  async deleteCode(email: string, postfix: string ): Promise<void> {
    const key = this.prefix + email + postfix;
    await this.redisService.del(key);
  }

  async verifyCode(email: string, code: string, postfix: string): Promise<void> {
    const storedCode = await this.getCode(email, postfix);
    if (!storedCode || storedCode !== code) {
      throw EXCEPTIONS.VERIFY_CODE_ERROR;
    }
  }
}