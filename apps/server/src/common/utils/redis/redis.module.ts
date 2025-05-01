import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Configurations } from 'src/common/config';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: Configurations.REDIS_HOST,
        port: Configurations.REDIS_PORT,
        password: Configurations.REDIS_PASSWORD,
        db: Configurations.REDIS_DB,
      },
    }),
  ],
})
export class RedisCacheModule {}
