import { Body, Controller, Delete, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtPayload } from '@triptrip/utils';
import { User } from 'src/common/decorators/user.decorator';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  addFollow(@User() user: JwtPayload, @Body('followerId', ParseIntPipe) followingId: number) {
    this.followService.addFollow(user.uid, followingId);
  }

  @Delete()
  removeFollow(@User() user: JwtPayload, @Body('followId', ParseIntPipe) followingId: number) {
    this.followService.removeFollow(user.uid, followingId);
  }
  @Get()
  getFollowList(@User() user: JwtPayload, @Query ('page', ParseIntPipe) page: number, @Query ('limit', ParseIntPipe) limit: number) {
    return this.followService.getFollowList(user.uid, page, limit);
  }
}
