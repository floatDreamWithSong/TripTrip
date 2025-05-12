import { Module, forwardRef } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
// import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  // imports: [ScheduleModule],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService]
})
export class LikeModule {}
