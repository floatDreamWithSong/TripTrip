import * as crypto from 'crypto';
import { Configurations } from '../../config';

export class CryptoUtils {
  private static readonly algorithm = 'aes-256-cbc';
  private static readonly ivLength = 16;
  private static readonly keyLength = 32;

  private static validateKey(key: string): Buffer {
    if (key.length !== this.keyLength * 2) {
      // Hex string length is 2x bytes
      throw new Error(
        `Invalid key length. Expected ${this.keyLength} bytes (${this.keyLength * 2} hex chars)`,
      );
    }
    return Buffer.from(key, 'hex');
  }

  static encrypt(text: string, secretKey: string = Configurations.CRYPTO_SECRET): string {
    const iv = crypto.randomBytes(this.ivLength);
    const keyBuffer = this.validateKey(secretKey);
    const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  static decrypt(encryptedText: string, secretKey: string = Configurations.CRYPTO_SECRET): string {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const keyBuffer = this.validateKey(secretKey);
    const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  static generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }
}
