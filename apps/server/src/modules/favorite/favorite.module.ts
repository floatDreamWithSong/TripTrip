import { Module, forwardRef } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [ScheduleModule],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [FavoriteService]
})
export class FavoriteModule {}
