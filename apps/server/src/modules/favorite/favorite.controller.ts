import { Body, Controller, Delete, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload, PageQuery, pageQuerySchema } from '@triptrip/utils';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) { }

  @Post()
  async addFavorite(@User() user: JwtPayload, @Body('passageId', ParseIntPipe) passageId: number) {
    return this.favoriteService.addFavorite(user.uid, passageId);
  }
  @Delete()
  async removeFavorite(@User() user: JwtPayload, @Body('passageId', ParseIntPipe) passageId: number) {
    return this.favoriteService.removeFavorite(user.uid, passageId);
  }
  @Get()
  async getFavoriteList(@User() user: JwtPayload, @Query(ZodValidationPipe.pageQuerySchema) query: PageQuery) {
    return this.favoriteService.getFavoriteList(user.uid, query.page, query.limit);
  }
}
