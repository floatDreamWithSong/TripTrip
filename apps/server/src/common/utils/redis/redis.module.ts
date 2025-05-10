import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Configurations } from 'src/common/config';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: Configurations.REDIS_URL,
    }),
  ],
})
export class RedisCacheModule {}
