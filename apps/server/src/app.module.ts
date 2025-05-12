import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guards/jwt.guard';
import { UserTypeGuard } from './common/guards/user-type.guard';
import { UserModule } from './modules/user/user.module';
import { JwtUtilsModule } from './common/utils/jwt/jwt.module';
import { Configurations } from './common/config';
import { PrismaModule } from './common/utils/prisma/prisma.module';
import { RedisCacheModule } from './common/utils/redis/redis.module';
import { PassageModule } from './modules/passage/passage.module';
import { CommentModule } from './modules/comment/comment.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { FollowModule } from './modules/follow/follow.module';
import { LikeModule } from './modules/like/like.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UserModule,
    JwtUtilsModule,
    Configurations,
    PrismaModule,
    RedisCacheModule,
    PassageModule,
    CommentModule,
    LikeModule,
    FavoriteModule,
    FollowModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserTypeGuard,
    },
  ],
})
export class AppModule {}
