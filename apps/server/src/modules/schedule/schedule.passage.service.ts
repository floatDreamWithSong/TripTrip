import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';
import { LikeService } from '../like/like.service';
import { PASSAGE_STATUS } from '@triptrip/utils';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulePassageService {
    private readonly logger = new Logger(SchedulePassageService.name);
    constructor(private readonly prismaService: PrismaService) { }
    @Cron(CronExpression.EVERY_MINUTE)
    async updateAllPassagesRating() {
        this.logger.log('开始更新所有文章评分...');

        try {
            // 获取所有未删除的文章
            const passages = await this.prismaService.passage.findMany({
                where: {
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
            // 获取文章信息
            const passage = await this.prismaService.passage.findUnique({
                where: { pid: passageId },
                select: {
                    views: true,
                    _count: {
                        select: {
                            favorites: true,
                            passageLikes: true,
                            comments: true
                        }
                    }
                }
            });

            if (!passage) {
                this.logger.warn(`文章不存在，ID: ${passageId}`);
                return;
            }

            // 计算评分
            const rating = this.caculateRating(passage);

            // 更新文章评分
            await this.prismaService.passage.update({
                where: { pid: passageId },
                data: { rating }
            });

            this.logger.debug(`已更新文章评分，ID: ${passageId}, 评分: ${rating}`);
        } catch (error) {
            this.logger.error(`更新文章评分失败，ID: ${passageId}`, error);
        }
    }
    private caculateRating(passage: { views: number; _count: { comments: number; passageLikes: number; favorites: number; }; }) {
        return passage._count.passageLikes * 2 + passage._count.favorites * 3 + passage._count.comments + Math.floor(passage.views / 50);
    }
}
