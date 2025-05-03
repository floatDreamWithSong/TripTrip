import { Module } from '@nestjs/common';
import { CosModule } from 'src/common/utils/cos/cos.module';
import { PassageController } from './passage.controller';
import { PassageService } from './passage.service';
import { PassageUserController } from './user/passage.user.controller';
import { PassageAdminController } from './admin/passage.admin.controller';
import { PassageUserService } from './user/passage.user.service';
import { PassageAdminService } from './admin/passage.admin.service';


@Module({
  imports: [CosModule],
  controllers: [PassageController, PassageUserController, PassageAdminController],
  providers: [PassageService, PassageUserService, PassageAdminService]
})
export class PassageModule {}
