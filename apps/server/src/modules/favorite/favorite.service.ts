import { Injectable, forwardRef, Inject, Logger } from '@nestjs/common';
import { JwtPayload } from '@triptrip/utils';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';
import { SchedulePassageService } from '../schedule/schedule.passage.service';

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);
  
  constructor(
    private readonly prismaService: PrismaService,
    private readonly schedulePassageService: SchedulePassageService
  ) {}
  
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
            isDeleted: true,
        }
        }
      }
    });
  }
  
  async addFavorite(userId: number, passageId: number) {
    await this.prismaService.favorite.create({
      data: {
        userId,
        passageId
      },
    });
    
    // 标记文章需要更新评分
    this.schedulePassageService.markPassageForRatingUpdate(passageId).catch(err => {
      this.logger.error(`标记文章评分更新失败，ID: ${passageId}`, err);
    });

    return 'success';
  }
  
  async removeFavorite(userId: number, passageId: number) {
    await this.prismaService.favorite.delete({
      where: {
        userId_passageId: {
          userId,
          passageId
        }
      }
    });
    
    // 标记文章需要更新评分
    this.schedulePassageService.markPassageForRatingUpdate(passageId).catch(err => {
      this.logger.error(`标记文章评分更新失败，ID: ${passageId}`, err);
    });
    
    return 'success';
  }
}
