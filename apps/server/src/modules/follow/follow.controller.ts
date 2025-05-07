import { Body, Controller, Delete, ParseIntPipe, Post } from '@nestjs/common';
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
}
