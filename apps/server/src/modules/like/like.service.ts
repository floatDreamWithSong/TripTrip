import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';
import { SchedulePassageService } from '../schedule/schedule.passage.service';

@Injectable()
export class LikeService {
  private readonly logger = new Logger(LikeService.name);
  private readonly PASSAGE_LIKE_KEY = 'passage_like:';
  private readonly COMMENT_LIKE_KEY = 'comment_like:';

  constructor(
    private readonly prismaService: PrismaService,
    @InjectRedis() private readonly redisService: Redis,
    private readonly schedulePassageService: SchedulePassageService
  ) {}

  async addPassageLike(userId: number, passageId: number) {
    const key = `${this.PASSAGE_LIKE_KEY}${passageId}`;
    await this.redisService.sadd(key, userId.toString());
    
    // 标记文章需要更新评分
    this.schedulePassageService.markPassageForRatingUpdate(passageId).catch(err => {
      this.logger.error(`标记文章评分更新失败，ID: ${passageId}`, err);
    });
    
    return { success: true };
  }

  async removePassageLike(userId: number, passageId: number) {
    const key = `${this.PASSAGE_LIKE_KEY}${passageId}`;
    await this.redisService.srem(key, userId.toString());
    
    // 标记文章需要更新评分
    this.schedulePassageService.markPassageForRatingUpdate(passageId).catch(err => {
      this.logger.error(`标记文章评分更新失败，ID: ${passageId}`, err);
    });
    
    return { success: true };
  }

  async addCommentLike(userId: number, commentId: number) {
    const key = `${this.COMMENT_LIKE_KEY}${commentId}`;
    await this.redisService.sadd(key, userId.toString());
    return { success: true };
  }

  async removeCommentLike(userId: number, commentId: number) {
    const key = `${this.COMMENT_LIKE_KEY}${commentId}`;
    await this.redisService.srem(key, userId.toString());
    return { success: true };
  }

  // 每到1分钟整数倍同步一次点赞数据
  @Cron(CronExpression.EVERY_MINUTE)
  private async startSyncTask() {
    await this.syncLikesToDatabase();
  }

  private async syncLikesToDatabase() {
    // 同步文章点赞数据
    const passageLikeKeys = await this.redisService.keys(`${this.PASSAGE_LIKE_KEY}*`);
    for (const key of passageLikeKeys) {
      const passageId = parseInt(key.split(':')[1]);
      const userIds = await this.redisService.smembers(key);
      
      for (const userId of userIds) {
        try {
          await this.prismaService.passageLike.upsert({
            where: {
              userId_passageId: {
                userId: parseInt(userId),
                passageId
              }
            },
            create: {
              userId: parseInt(userId),
              passageId
            },
            update: {}
          });
        } catch (error) {
          this.logger.error(`同步文章点赞数据失败: ${error.message}`);
        }
      }
    }

    // 同步评论点赞数据
    const commentLikeKeys = await this.redisService.keys(`${this.COMMENT_LIKE_KEY}*`);
    for (const key of commentLikeKeys) {
      const commentId = parseInt(key.split(':')[1]);
      const userIds = await this.redisService.smembers(key);
      
      for (const userId of userIds) {
        try {
          await this.prismaService.commentLike.upsert({
            where: {
              userId_commentId: {
                userId: parseInt(userId),
                commentId
              }
            },
            create: {
              userId: parseInt(userId),
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

  async getPassageLikeCount(passageId: number): Promise<number> {
    const key = `${this.PASSAGE_LIKE_KEY}${passageId}`;
    return await this.redisService.scard(key);
  }

  async getCommentLikeCount(commentId: number): Promise<number> {
    const key = `${this.COMMENT_LIKE_KEY}${commentId}`;
    return await this.redisService.scard(key);
  }

  async hasUserLikedPassage(userId: number, passageId: number): Promise<boolean> {
    const key = `${this.PASSAGE_LIKE_KEY}${passageId}`;
    return (await this.redisService.sismember(key, userId.toString())) === 1;
  }

  async hasUserLikedComment(userId: number, commentId: number): Promise<boolean> {
    const key = `${this.COMMENT_LIKE_KEY}${commentId}`;
    return (await this.redisService.sismember(key, userId.toString())) === 1;
  }
}
