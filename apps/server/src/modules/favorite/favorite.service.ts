import { Injectable, forwardRef, Inject, Logger } from '@nestjs/common';
import { JwtPayload } from '@triptrip/utils';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';
import { PassageService } from '../passage/passage.service';

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);
  
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => PassageService)) private readonly passageService?: PassageService
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
    
    // 更新文章评分
    if (this.passageService) {
      this.passageService.updatePassageRating(passageId).catch(err => {
        this.logger.error(`更新文章评分失败，ID: ${passageId}`, err);
      });
    }
    
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
    
    // 更新文章评分
    if (this.passageService) {
      this.passageService.updatePassageRating(passageId).catch(err => {
        this.logger.error(`更新文章评分失败，ID: ${passageId}`, err);
      });
    }
    
    return 'success';
  }
}
