import { Module, forwardRef } from '@nestjs/common';
import { CosModule } from 'src/common/utils/cos/cos.module';
import { PassageController } from './passage.controller';
import { PassageService } from './passage.service';
import { PassageUserController } from './user/passage.user.controller';
import { PassageAdminController } from './admin/passage.admin.controller';
import { PassageUserService } from './user/passage.user.service';
import { PassageAdminService } from './admin/passage.admin.service';
import { LikeModule } from '../like/like.module';
import { FavoriteModule } from '../favorite/favorite.module';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [
    CosModule, 
    forwardRef(() => LikeModule),
    forwardRef(() => FavoriteModule),
    ScheduleModule
  ],
  controllers: [PassageController, PassageUserController, PassageAdminController],
  providers: [PassageService, PassageUserService, PassageAdminService],
  exports: [PassageService]
})
export class PassageModule {}
