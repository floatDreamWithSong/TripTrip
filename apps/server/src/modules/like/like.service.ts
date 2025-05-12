import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Redis from 'ioredis';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';
import { PassageService } from '../passage/passage.service';

@Injectable()
export class LikeService {
  private readonly logger = new Logger(LikeService.name);
  private readonly PASSAGE_LIKE_KEY = 'passage_like:';
  private readonly COMMENT_LIKE_KEY = 'comment_like:';

  constructor(
    private readonly prismaService: PrismaService,
    @InjectRedis() private readonly redisService: Redis,
    @Inject(forwardRef(() => PassageService)) private readonly passageService?: PassageService
  ) {}

  async addPassageLike(userId: number, passageId: number) {
    const key = `${this.PASSAGE_LIKE_KEY}${passageId}`;
    await this.redisService.setbit(key, userId - 1, 1);
    
    // 更新文章评分
    if (this.passageService) {
      this.passageService.updatePassageRating(passageId).catch(err => {
        this.logger.error(`更新文章评分失败，ID: ${passageId}`, err);
      });
    }
    
    return { success: true };
  }

  async removePassageLike(userId: number, passageId: number) {
    const key = `${this.PASSAGE_LIKE_KEY}${passageId}`;
    await this.redisService.setbit(key, userId - 1, 0);
    
    // 更新文章评分
    if (this.passageService) {
      this.passageService.updatePassageRating(passageId).catch(err => {
        this.logger.error(`更新文章评分失败，ID: ${passageId}`, err);
      });
    }
    
    return { success: true };
  }

  async addCommentLike(userId: number, commentId: number) {
    const key = `${this.COMMENT_LIKE_KEY}${commentId}`;
    await this.redisService.setbit(key, userId - 1, 1);
    return { success: true };
  }

  async removeCommentLike(userId: number, commentId: number) {
    const key = `${this.COMMENT_LIKE_KEY}${commentId}`;
    await this.redisService.setbit(key, userId - 1, 0);
    return { success: true };
  }

  // 每小时的5倍数分钟同步一次点赞数据
  @Cron('0 */5 * * * *')
  private async startSyncTask() {
    this.logger.log('开始同步点赞数据')
    await this.syncLikesToDatabase();
    this.logger.log('同步点赞结束')
  }

  private async syncLikesToDatabase() {
    // 同步文章点赞数据
    const passageLikeKeys = await this.redisService.keys(`${this.PASSAGE_LIKE_KEY}*`);
    for (const key of passageLikeKeys) {
      const passageId = parseInt(key.split(':')[1]);
      const bitmap = await this.redisService.get(key);
      
      if (bitmap) {
        const buffer = Buffer.from(bitmap);
        for (let i = 0; i < buffer.length * 8; i++) {
          const byteIndex = Math.floor(i / 8);
          const bitIndex = i % 8;
          const isLiked = (buffer[byteIndex] & (1 << bitIndex)) !== 0;
          
          if (isLiked) {
            try {
              // 将位图索引加1，转换为实际的uid
              const uid = i + 1;
              
              // 先检查用户是否存在
              const user = await this.prismaService.user.findUnique({
                where: { uid }
              });

              if (!user) {
                this.logger.warn(`用户ID ${uid} 不存在，跳过同步`);
                continue;
              }

              await this.prismaService.passageLike.upsert({
                where: {
                  userId_passageId: {
                    userId: uid,
                    passageId
                  }
                },
                create: {
                  userId: uid,
                  passageId
                },
                update: {}
              });
            } catch (error) {
              this.logger.error(`同步文章点赞数据失败: ${error.message}`);
            }
          }
        }
      }
    }

    // 同步评论点赞数据
    const commentLikeKeys = await this.redisService.keys(`${this.COMMENT_LIKE_KEY}*`);
    for (const key of commentLikeKeys) {
      const commentId = parseInt(key.split(':')[1]);
      const bitmap = await this.redisService.get(key);
      
      if (bitmap) {
        const buffer = Buffer.from(bitmap);
        for (let i = 0; i < buffer.length * 8; i++) {
          const byteIndex = Math.floor(i / 8);
          const bitIndex = i % 8;
          const isLiked = (buffer[byteIndex] & (1 << bitIndex)) !== 0;
          
          if (isLiked) {
            try {
              // 将位图索引加1，转换为实际的uid
              const uid = i + 1;
              
              // 先检查用户是否存在
              const user = await this.prismaService.user.findUnique({
                where: { uid }
              });

              if (!user) {
                this.logger.warn(`用户ID ${uid} 不存在，跳过同步`);
                continue;
              }

              await this.prismaService.commentLike.upsert({
                where: {
                  userId_commentId: {
                    userId: uid,
                    commentId
                  }
                },
                create: {
                  userId: uid,
                  commentId
                },
                update: {}
              });
            } catch (error) {
              this.logger.error(`同步评论点赞数据失败: ${error.message}`);
            }
          }
        }
      }
    }
  }

  async getPassageLikeCount(passageId: number): Promise<number> {
    const key = `${this.PASSAGE_LIKE_KEY}${passageId}`;
    const bitmap = await this.redisService.get(key);
    if (!bitmap) return 0;
    
    let count = 0;
    const buffer = Buffer.from(bitmap);
    for (let i = 0; i < buffer.length; i++) {
      count += this.countBits(buffer[i]);
    }
    return count;
  }

  async getCommentLikeCount(commentId: number): Promise<number> {
    const key = `${this.COMMENT_LIKE_KEY}${commentId}`;
    const bitmap = await this.redisService.get(key);
    if (!bitmap) return 0;
    
    let count = 0;
    const buffer = Buffer.from(bitmap);
    for (let i = 0; i < buffer.length; i++) {
      count += this.countBits(buffer[i]);
    }
    return count;
  }

  async hasUserLikedPassage(userId: number, passageId: number): Promise<boolean> {
    const key = `${this.PASSAGE_LIKE_KEY}${passageId}`;
    return (await this.redisService.getbit(key, userId - 1)) === 1;
  }

  async hasUserLikedComment(userId: number, commentId: number): Promise<boolean> {
    const key = `${this.COMMENT_LIKE_KEY}${commentId}`;
    return (await this.redisService.getbit(key, userId - 1)) === 1;
  }

  private countBits(byte: number): number {
    let count = 0;
    while (byte) {
      count += byte & 1;
      byte >>= 1;
    }
    return count;
  }
}
