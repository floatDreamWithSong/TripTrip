import { Body, Controller, Delete, ParseIntPipe, Post } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload } from '@triptrip/utils';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  addFavorite(@User() user: JwtPayload, @Body('passageId', ParseIntPipe) passageId: number) {
    this.favoriteService.addFavorite(user.uid, passageId);
  }
  @Delete()
  removeFavorite(@User() user: JwtPayload, @Body('passageId', ParseIntPipe) passageId: number) {
    this.favoriteService.removeFavorite(user.uid, passageId);
  }
}
