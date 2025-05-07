import { Injectable } from '@nestjs/common';
import { JwtPayload } from '@triptrip/utils';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  getFavoriteList(uid: number, page: number, limit: number) {
    return this.prismaService.favorite.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { userId: uid },
      include: {
        passage: {
          include: {
            author: {
              select: {
                uid: true,
                username: true,
                avatar: true,
              }
            }
          },
          omit: {
            reason: true,
            content: true,
            status: true,
            videoUrl: true,
        }
        }
      }
    });
  }
  constructor(private readonly prismaService: PrismaService) {}
  async addFavorite(userId: number, passageId: number) {
    await this.prismaService.favorite.create({
      data: {
        userId,
        passageId
      },
    });
    return 'success';
  }
  removeFavorite(userId: number, passageId: number) {
    this.prismaService.favorite.delete({
      where: {
        userId_passageId: {
          userId,
          passageId
        }
      }
    });
    return'success';
  }
}
