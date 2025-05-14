import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, OnModuleInit } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 配置模块全局可用
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // 按顺序加载环境文件
    }),
  ],
})
export class Configurations implements OnModuleInit {
  private static configService: ConfigService;

  // 静态字段，用于直接访问环境变量
  static HTTP_TIMEOUT = 5000;
  static HTTP_MAX_REDIRECTS = 5;
  static DATABASE_URL: string;
  static JWT_SECRET: string;
  static ACCESS_TOKEN_EXPIRATION_TIME: string;
  static REFRESH_TOKEN_EXPIRATION_TIME: string;
  static MAIL_HOST: string;
  static MAIL_PORT: number;
  static MAIL_USER: string;
  static MAIL_PASS: string;
  static COS_SECRET_ID: string;
  static COS_SECRET_KEY: string;
  static COS_BUCKET: string;
  static COS_ENDPOINT: string;
  static COS_REGION: string = 'ap-shanghai';
  static CRYPTO_SECRET: string;
  static API_KEY: string;
  static BASE_URL: string;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    Configurations.configService = this.configService;
    // 使用getOrThrow确保必须读取到环境变量
    Configurations.DATABASE_URL = this.configService.getOrThrow<string>('DATABASE_URL');
    Configurations.JWT_SECRET = this.configService.getOrThrow<string>('JWT_SECRET');
    Configurations.ACCESS_TOKEN_EXPIRATION_TIME = this.configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRATION_TIME');
    Configurations.REFRESH_TOKEN_EXPIRATION_TIME = this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRATION_TIME');
    Configurations.MAIL_HOST = this.configService.getOrThrow<string>('MAIL_HOST');
    Configurations.MAIL_PORT = this.configService.getOrThrow<number>('MAIL_PORT');
    Configurations.MAIL_USER = this.configService.getOrThrow<string>('MAIL_USER');
    Configurations.MAIL_PASS = this.configService.getOrThrow<string>('MAIL_PASS');
    Configurations.COS_SECRET_ID = this.configService.getOrThrow<string>('COS_SECRET_ID');
    Configurations.COS_SECRET_KEY = this.configService.getOrThrow<string>('COS_SECRET_KEY');
    Configurations.COS_BUCKET = this.configService.getOrThrow<string>('COS_BUCKET');
    Configurations.COS_ENDPOINT = this.configService.getOrThrow<string>('COS_ENDPOINT');
    Configurations.CRYPTO_SECRET = this.configService.getOrThrow<string>('CRYPTO_SECRET');
    Configurations.API_KEY = this.configService.getOrThrow<string>('API_KEY');
    Configurations.BASE_URL = this.configService.getOrThrow<string>('BASE_URL');

    console.log('Configurations.API_KEY', Configurations.API_KEY);
    console.log('Configurations.BASE_URL', Configurations.BASE_URL);

    console.log('Configurations.BUCKET', Configurations.COS_BUCKET);
    console.log('access token expiration time', Configurations.ACCESS_TOKEN_EXPIRATION_TIME);
    console.log('refresh token expiration time', Configurations.REFRESH_TOKEN_EXPIRATION_TIME);
    // 对于HTTP_TIMEOUT和HTTP_MAX_REDIRECTS这类有默认值的配置可以保持原样
  }

  // 提供一个静态方法来访问环境变量
  static getEnvVariable(key: string): string | undefined {
    return this.configService.get<string>(key);
  }
}
