import { Module, forwardRef } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { PassageModule } from '../passage/passage.module';

@Module({
  imports: [forwardRef(() => PassageModule)],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [FavoriteService]
})
export class FavoriteModule {}
