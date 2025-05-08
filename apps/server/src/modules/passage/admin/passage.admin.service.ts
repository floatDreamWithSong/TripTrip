import { Injectable, Logger } from "@nestjs/common";
import { PASSAGE_STATUS } from "@triptrip/utils";
import { PrismaService } from "src/common/utils/prisma/prisma.service";
@Injectable()
export class PassageAdminService {
  private readonly logger = new Logger(PassageAdminService.name);
  constructor(private readonly prismaService: PrismaService) { }
  async getGlobalReviewStatistics() {
    const queryResult = await this.prismaService.passage.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: {
        status: {
          in: [
            PASSAGE_STATUS.PENDING,
            PASSAGE_STATUS.REJECTED,
            PASSAGE_STATUS.APPROVED,
          ]
        }
      }
    })

    const data: { day: string, submitted: number, approved: number, rejected: number }[] = [];
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    // 获取审核统计数据（基于reviewTime）
    const reviewStats = await this.prismaService.passage.groupBy({
      by: ['status', 'reviewTime'],
      where: {
        reviewTime: {
          not: null,
          gte: dates[0],
          lt: new Date(dates[6].getFullYear(), dates[6].getMonth(), dates[6].getDate() + 1)
        }
      },
      _count: {
        status: true
      }
    });

    // 获取提交统计数据（基于publishTime）
    const submitStats = await this.prismaService.passage.groupBy({
      by: ['publishTime'],
      where: {
        publishTime: {
          gte: dates[0],
          lt: new Date(dates[6].getFullYear(), dates[6].getMonth(), dates[6].getDate() + 1)
        }
      },
      _count: {
        status: true
      }
    });

    for (const date of dates) {
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      // 统计当天的审核数据
      const dayReviewStats = reviewStats.filter(stat => {
        if (!stat.reviewTime) return false;
        const statDate = new Date(stat.reviewTime);
        return statDate >= start && statDate < end;
      });

      // 统计当天的提交数据
      const daySubmitStats = submitStats.filter(stat => {
        if (!stat.publishTime) return false;
        const statDate = new Date(stat.publishTime);
        return statDate >= start && statDate < end;
      });

      const approved = dayReviewStats.filter(stat => stat.status === PASSAGE_STATUS.APPROVED).reduce((acc, stat) => acc + stat._count.status, 0);
      const rejected = dayReviewStats.filter(stat => stat.status === PASSAGE_STATUS.REJECTED).reduce((acc, stat) => acc + stat._count.status, 0);
      const submitted = daySubmitStats.reduce((acc, stat) => acc + stat._count.status, 0);

      data.push({
        day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        submitted,
        approved,
        rejected,
      });
    }
    const result = {
      total: queryResult.reduce((acc, cur) => acc + cur._count.status, 0),
      pending: queryResult.find((item) => item.status === PASSAGE_STATUS.PENDING)?._count.status || 0,
      approved: queryResult.find((item) => item.status === PASSAGE_STATUS.APPROVED)?._count.status || 0,
      rejected: queryResult.find((item) => item.status === PASSAGE_STATUS.REJECTED)?._count.status || 0,
      data: data,
    }
    return result;
  }

  async updateByAdmin(pid: number, status: number, reason?: string) {
    await this.prismaService.passage.update({
      where: {
        pid: pid,
        status: PASSAGE_STATUS.PENDING,
      },
      data: {
        status: status,
        reason: reason,
        reviewTime: new Date(),
      }
    })
    return;
  }
}