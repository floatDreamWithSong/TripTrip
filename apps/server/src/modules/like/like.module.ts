import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';

@Module({
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService]
})
export class LikeModule {}
