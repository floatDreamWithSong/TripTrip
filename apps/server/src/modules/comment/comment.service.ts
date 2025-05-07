import { Injectable } from '@nestjs/common';
import { JwtPayload, USER_TYPE } from '@triptrip/utils';
import { EXCEPTIONS } from 'src/common/exceptions';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';


@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}
  async createPassageComment(uid: number, passageId: number, content: string) {
    const comment = await this.prismaService.comment.create({
      data: {
        userId: uid,
        passageId,
        content
      }
    })
  }
  async createReplyComment(uid: number, passageId: number, parentId: number , content: string) {
    const comment = await this.prismaService.comment.create({
      data: {
        userId: uid,
        passageId,
        parentId,
        content
      }
    })
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
    await this.prismaService.comment.delete({
      where: {
        cid
      }
    })
  }

}
