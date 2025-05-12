import { Injectable } from '@nestjs/common';
import { JwtPayload, USER_TYPE } from '@triptrip/utils';
import { EXCEPTIONS } from 'src/common/exceptions';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';
import { SchedulePassageService } from '../schedule/schedule.passage.service';


@Injectable()
export class CommentService {
  getPassageCommentList(passageId: number, page: number, limit: number) {
    return this.prismaService.comment.findMany({
      where: {
        passageId,
        parentId: null
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            uid: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    })
  }
  getReplyCommentList(parentId: number, page: number, limit: number) {
    return this.prismaService.comment.findMany({
      where: {
        parentId
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            uid: true,
            username: true,
            avatar: true
          }
        }
      }
    })
  }
  constructor(
    private readonly prismaService: PrismaService,
    private readonly schedulePassageService: SchedulePassageService
  ) {}
  async createPassageComment(uid: number, passageId: number, content: string) {
    const comment = await this.prismaService.comment.create({
      data: {
        userId: uid,
        passageId,
        content
      }
    });
    
    // 标记文章需要更新评分
    this.schedulePassageService.markPassageForRatingUpdate(passageId).catch(err => {
      console.error(`标记文章评分更新失败，ID: ${passageId}`, err);
    });
    
    return comment;
  }
  async createReplyComment(uid: number, passageId: number, parentId: number, content: string) {
    const comment = await this.prismaService.comment.create({
      data: {
        userId: uid,
        passageId,
        parentId,
        content
      }
    });
    
    // 标记文章需要更新评分
    this.schedulePassageService.markPassageForRatingUpdate(passageId).catch(err => {
      console.error(`标记文章评分更新失败，ID: ${passageId}`, err);
    });
    
    return comment;
  }
  async removeComment(user: JwtPayload, cid: number) {
    // 检测是否是作者
    const comment = await this.prismaService.comment.findUnique({
      where: {
        cid
      }
    })
    if (!comment) {
      throw EXCEPTIONS.COMMENT_NOT_FOUND
    }
    if (user.type !== USER_TYPE.ADMIN && comment.userId !== user.uid) {
      throw EXCEPTIONS.COMMENT_DELETE_FAILED
    }
    // 删除评论及其回复，通过事务删除
    await this.prismaService.$transaction(async (tx) => {
      await Promise.all([
        tx.comment.deleteMany({
          where: {
            parentId: cid
          }
        }),
        tx.comment.delete({
          where: {
            cid
          }
        })
      ])

    })
    
  }

}
