import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PassageService } from '../passage.service';

@Injectable()
export class PassageTasksService {
  private readonly logger = new Logger(PassageTasksService.name);

  constructor(private readonly passageService: PassageService) {}

  /**
   * 每小时更新一次所有文章的评分
   * 时间：每小时整点执行
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updateAllPassagesRating() {
    this.logger.log('开始执行定时任务：更新所有文章评分');
    try {
      await this.passageService.updateAllPassagesRating();
      this.logger.log('定时任务执行完成：更新所有文章评分');
    } catch (error) {
      this.logger.error('定时任务执行失败：更新所有文章评分', error);
    }
  }
} 