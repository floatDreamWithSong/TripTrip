import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';

@Injectable()
export class FollowService {
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
