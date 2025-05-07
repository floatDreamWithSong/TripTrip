import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';

@Injectable()
export class FollowService {
  getFollowList(uid: number, page: number, limit: number) {
    return this.prismaService.userFollow.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        followerId: uid
      },
      include: {
        following: {
          select: {
            uid: true,
            username: true,
            avatar: true,
          }
        }
      }
    })
  }
  constructor(private readonly prismaService: PrismaService) {}
  async addFollow(followerId: number, followingId: number) {
    await this.prismaService.userFollow.create({
      data: {
        followerId,
        followingId,
      }
    })
  }
  async removeFollow(followerId: number, followingId: number) {
    await this.prismaService.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        }
      }
    })
  }

}
