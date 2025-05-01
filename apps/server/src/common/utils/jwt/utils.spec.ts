import { CryptoUtils } from './utils';
import { Configurations } from '../../config';

describe.skip('CryptoUtils', () => {
  const testText = 'Hello, WonderLand!';
  let encryptedText: string;

  beforeAll(() => {
    // Generate and set a valid key if not present
    if (!Configurations.CRYPTO_SECRET || Configurations.CRYPTO_SECRET.length !== 64) {
      Configurations.CRYPTO_SECRET = CryptoUtils.generateKey();
      console.log('Generated a new key for testing:', Configurations.CRYPTO_SECRET);
    }
  });

  it('should throw error for invalid key length', () => {
    expect(() => CryptoUtils.encrypt(testText, 'shortkey')).toThrow('Invalid key length');
  });

  it('should encrypt and decrypt text correctly', () => {
    // 加密测试
    encryptedText = CryptoUtils.encrypt(testText);
    expect(encryptedText).toBeDefined();
    expect(encryptedText).toContain(':'); // 检查IV和加密文本的分隔符

    // 解密测试
    const decryptedText = CryptoUtils.decrypt(encryptedText);
    expect(decryptedText).toBe(testText);
  });

  it('should return different encrypted text for same input', () => {
    const encrypted1 = CryptoUtils.encrypt(testText);
    const encrypted2 = CryptoUtils.encrypt(testText);
    expect(encrypted1).not.toBe(encrypted2); // 由于IV不同，加密结果应不同
  });

  it('should work with custom secret key', () => {
    const customKey = CryptoUtils.generateKey();
    const encrypted = CryptoUtils.encrypt(testText, customKey);
    const decrypted = CryptoUtils.decrypt(encrypted, customKey);
    expect(decrypted).toBe(testText);
  });

  it('should throw error when decrypting with wrong key', () => {
    const wrongKey = CryptoUtils.generateKey();
    expect(() => {
      CryptoUtils.decrypt(encryptedText, wrongKey);
    }).toThrow();
  });

  it('should generate valid 32-byte key', () => {
    const key = CryptoUtils.generateKey();
    expect(key).toHaveLength(64); // 32字节的hex表示长度为64
    expect(Buffer.from(key, 'hex')).toHaveLength(32);
  });
});
