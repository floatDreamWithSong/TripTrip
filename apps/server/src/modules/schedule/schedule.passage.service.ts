import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';
import { LikeService } from '../like/like.service';
import { PASSAGE_STATUS } from '@triptrip/utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class SchedulePassageService {
    private readonly logger = new Logger(SchedulePassageService.name);
    private readonly PASSAGE_UPDATE_KEY = 'passage_update_ids';
    
    constructor(
        private readonly prismaService: PrismaService,
        @InjectRedis() private readonly redisService: Redis
    ) { }
    
    /**
     * 将文章ID标记为需要更新评分
     * @param passageId 文章ID
     */
    async markPassageForRatingUpdate(passageId: number) {
        await this.redisService.sadd(this.PASSAGE_UPDATE_KEY, passageId.toString());
    }
    
    @Cron(CronExpression.EVERY_5_SECONDS)
    async updateAllPassagesRating() {
        this.logger.log('开始更新文章评分...');

        try {
            // 获取需要更新的文章ID
            const passageIdsToUpdate = await this.redisService.smembers(this.PASSAGE_UPDATE_KEY);
            
            if (passageIdsToUpdate.length > 0) {
                // 清空Redis中的更新列表
                await this.redisService.del(this.PASSAGE_UPDATE_KEY);
                
                // 获取需要更新的文章数据
                const passages = await this.prismaService.passage.findMany({
                    where: {
                        pid: {
                            in: passageIdsToUpdate.map(id => parseInt(id))
                        },
                        isDeleted: false,
                        status: PASSAGE_STATUS.APPROVED
                    },
                    select: {
                        pid: true,
                        views: true,
                        _count: {
                            select: {
                                passageLikes: true,
                                favorites: true,
                                comments: true
                            }
                        }
                    }
                });

                // 批量更新文章评分
                await Promise.all(passages.map(async (passage) => {
                    // 计算评分
                    const rating = this.caculateRating(passage);
                    // 更新文章评分
                    return this.prismaService.passage.update({
                        where: { pid: passage.pid },
                        data: { rating }
                    });
                }));
                
                this.logger.log(`成功更新 ${passages.length} 篇文章的评分`);
            } else {
                this.logger.log('没有需要更新评分的文章');
            }
        } catch (error) {
            this.logger.error('更新文章评分失败', error);
            throw error;
        }
    }
    
    /**
    * 更新单篇文章的评分
    * 当文章被点赞、收藏或阅读时调用
    * @param passageId 文章ID
    */
    async updatePassageRating(passageId: number) {
        try {
            // 将文章ID标记为需要更新评分
            await this.markPassageForRatingUpdate(passageId);
            
            // 记录日志
            this.logger.debug(`文章已标记为需要更新评分，ID: ${passageId}`);
        } catch (error) {
            this.logger.error(`标记文章评分更新失败，ID: ${passageId}`, error);
        }
    }
    
    private caculateRating(passage: { views: number; _count: { comments: number; passageLikes: number; favorites: number; }; }) {
        return passage._count.passageLikes * 2 + passage._count.favorites * 3 + passage._count.comments + Math.floor(passage.views / 50);
    }
}
