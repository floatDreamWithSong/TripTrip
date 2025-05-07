import { Controller,  Post, Body, Delete, ParseIntPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload } from '@triptrip/utils';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }
  @Post('passage')
  createPassageComment(@User() user: JwtPayload, @Body('passageId', ParseIntPipe) passageId: number, @Body('content') content: string) {
    return this.commentService.createPassageComment(user.uid, passageId, content);
  }
  @Post('reply')
  createReplyComment(@User() user: JwtPayload,
    @Body('passageId', ParseIntPipe) passageId: number,
    @Body('parentId', ParseIntPipe) parentId: number,
    @Body('content') content: string) {

    return this.commentService.createReplyComment(
      user.uid, passageId,
      parentId,
      content);
  }
  @Delete()
  removeComment(@User() user: JwtPayload, @Body('commentId', ParseIntPipe) commentId: number) {
    return this.commentService.removeComment(user, commentId);
  }
}
