import { Body, Controller, Delete, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
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
  @Get()
  getFavoriteList(@User() user: JwtPayload, @Query ('page', ParseIntPipe) page: number, @Query ('limit', ParseIntPipe) limit: number) {
    return this.favoriteService.getFavoriteList(user.uid, page, limit);
  }
}
