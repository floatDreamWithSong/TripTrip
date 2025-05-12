import { Controller,  Post, Body, Delete, ParseIntPipe, Get, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload, PageQuery } from '@triptrip/utils';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }
  @Post('passage')
  async createPassageComment(@User() user: JwtPayload, @Body('passageId', ParseIntPipe) passageId: number, @Body('content') content: string) {
    return this.commentService.createPassageComment(user.uid, passageId, content);
  }
  @Post('reply')
  async createReplyComment(@User() user: JwtPayload,
    @Body('passageId', ParseIntPipe) passageId: number,
    @Body('parentId', ParseIntPipe) parentId: number,
    @Body('content') content: string) {

    return this.commentService.createReplyComment(
      user.uid, passageId,
      parentId,
      content);
  }
  @Delete()
  async removeComment(@User() user: JwtPayload, @Body('commentId', ParseIntPipe) commentId: number) {
    return this.commentService.removeComment(user, commentId);
  }
  @Get('passage')
  async getPassageCommentList(@Query('passageId', ParseIntPipe) passageId: number,
    @Query(ZodValidationPipe.pageQuerySchema) query: PageQuery) {
    return this.commentService.getPassageCommentList(passageId, query.page, query.limit);
  }
  @Get('reply')
  async getReplyCommentList(@Query('parentId', ParseIntPipe) parentId: number,
    @Query(ZodValidationPipe.pageQuerySchema) query: PageQuery) {
    return this.commentService.getReplyCommentList(parentId, query.page, query.limit);
  }
}
