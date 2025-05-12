import { Body, Controller, Delete, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtPayload, PageQuery } from '@triptrip/utils';
import { User } from 'src/common/decorators/user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  async addFollow(@User() user: JwtPayload, @Body('followerId', ParseIntPipe) followingId: number) {
    return this.followService.addFollow(user.uid, followingId);
  }

  @Delete()
  async removeFollow(@User() user: JwtPayload, @Body('followerId', ParseIntPipe) followingId: number) {
    return this.followService.removeFollow(user.uid, followingId);
  }
  @Get()
  async getFollowList(@User() user: JwtPayload, @Query(ZodValidationPipe.pageQuerySchema) query: PageQuery) {
    return this.followService.getFollowList(user.uid, query.page, query.limit);
  }
}
