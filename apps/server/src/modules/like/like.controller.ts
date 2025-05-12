import { Body, Controller, Delete, Get, HttpCode, HttpStatus, ParseIntPipe, Post } from '@nestjs/common';
import { LikeService } from './like.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload } from '@triptrip/utils';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}
  @Post('passage')
  @HttpCode(HttpStatus.OK)
  async addPassageLike(@User() user: JwtPayload, @Body('passageId', ParseIntPipe) passageId: number) {
    return this.likeService.addPassageLike(user.uid, passageId);
  }

  @Delete('passage')
  @HttpCode(HttpStatus.OK)
  async removePassageLike(@User() user: JwtPayload, @Body('passageId', ParseIntPipe) passageId: number) {
    return this.likeService.removePassageLike(user.uid, passageId);
  }
  
  @Post('comment')
  @HttpCode(HttpStatus.OK)
  async addCommentLike(@User() user: JwtPayload, @Body('commentId', ParseIntPipe) commentId: number) {
    return this.likeService.addCommentLike(user.uid, commentId);
  }

  @Delete('comment')
  @HttpCode(HttpStatus.OK)
  async removeCommentLike(@User() user: JwtPayload, @Body('commentId', ParseIntPipe) commentId: number) {
    return this.likeService.removeCommentLike(user.uid, commentId);
  }

  @Get('passage')
  @Public()
  async getPassageLike( @Body('passageId', ParseIntPipe) passageId: number, @User() user?: JwtPayload) {
    return {
      count: await this.likeService.getPassageLikeCount(passageId),
      isLike: user?  await this.likeService.hasUserLikedPassage(user.uid,passageId): false
    };
  }
  @Get('comment')
  @Public()
  async getCommentLike( @Body('commentId', ParseIntPipe) commentId: number, @User() user?: JwtPayload) {
    return {
      count: await this.likeService.getCommentLikeCount(commentId),
      isLike: user?  await this.likeService.hasUserLikedComment(user.uid,commentId): false
    };
  }
}
