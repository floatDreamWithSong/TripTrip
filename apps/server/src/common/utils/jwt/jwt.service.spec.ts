import { Test, TestingModule } from '@nestjs/testing';
import { JwtUtils } from './jwt.service';
import { Configurations } from 'src/common/config';
import { JwtPayload } from '@triptrip/types';

describe.skip('JwtService', () => {
  let jwtUtils: JwtUtils;
  let testPayload: JwtPayload;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [Configurations],
      providers: [JwtUtils],
    }).compile();
    testPayload = { openid: 'test-openid', iat: Math.floor(Date.now() / 1000), userType: 0 };
    jwtUtils = module.get<JwtUtils>(JwtUtils);
  });

  it('should be defined', () => {
    expect(jwtUtils).toBeDefined();
  });
  it('should sign payload and return token', () => {
    const token = jwtUtils.sign(testPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT由三部分组成
  });

  it('should verify valid token', () => {
    const token = jwtUtils.sign(testPayload);
    const decoded = jwtUtils.verify(token);

    expect(decoded).toBeDefined();
    expect(decoded.openid).toBe(testPayload.openid); // 使用严格相等
    expect(decoded.iat).toBeDefined();
  });

  it('should throw error for invalid token', () => {
    const invalidToken = 'invalid.token.here';
    expect(() => jwtUtils.verify(invalidToken)).toThrow();
  });

  it('should throw error for expired token', async () => {
    const expiredPayload = { ...testPayload };
    const expiredToken = jwtUtils.sign(expiredPayload);
    await new Promise((resolve) => setTimeout(resolve, 1100)); // 等待1.1秒以确保token过期
    expect(() => jwtUtils.verify(expiredToken)).toThrow();
  });
  it('should throw error for token with wrong secret', () => {
    const token = jwtUtils.sign(testPayload);
    // 修改配置中的密钥
    const originalSecret = Configurations.JWT_SECRET;
    Configurations.JWT_SECRET = 'wrong-secret-key-32-characters';

    expect(() => jwtUtils.verify(token)).toThrow();

    // 恢复原始密钥
    Configurations.JWT_SECRET = originalSecret;
  });
});
