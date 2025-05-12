import { Module } from '@nestjs/common';
import { SchedulePassageService } from './schedule.passage.service';

@Module({
  providers: [SchedulePassageService],
  exports: [SchedulePassageService]
})
export class ScheduleModule {}
