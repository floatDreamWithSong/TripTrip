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
    // 计算前7天内每天的通过和拒绝数量
    /**
     * 例如；
     *   const data = [
    { day: '周一', submitted: 40, approved: 24 },
    { day: '周二', submitted: 30, approved: 13 },
    { day: '周三', submitted: 20, approved: 18 },
    { day: '周四', submitted: 27, approved: 23 },
    { day: '周五', submitted: 18, approved: 12 },
    { day: '周六', submitted: 23, approved: 19 },
    { day: '周日', submitted: 34, approved: 32 },
  ];
     */
    const data: { day: string, submitted: number, approved: number }[] = [];
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const dailyStats = await this.prismaService.passage.groupBy({
      by: ['status', 'publishTime'],
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
      
      const dayStats = dailyStats.filter(stat => {
        const statDate = new Date(stat.publishTime);
        return statDate >= start && statDate < end;
      });

      const approved = dayStats.find(stat => stat.status === PASSAGE_STATUS.APPROVED)?._count.status || 0;
      const submitted = dayStats.reduce((acc, stat) => acc + stat._count.status, 0);

      data.push({
        day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        submitted,
        approved
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

  updateByAdmin(pid: number, status: number, reason?: string) {
    return this.prismaService.passage.update({
      where: {
        pid: pid,
        status: PASSAGE_STATUS.PENDING,
      },
      data: {
        status: status,
        reason: reason,
      }
    })
  }
  // listForAdmin(page: number, limit: number) {
  //   this.prismaService.passage.findMany({
  //     skip: (page - 1) * limit,
  //     take: limit,
  //     include: {
  //       PassageImage: true,
  //       PassageToTag: {
  //         include: {
  //           tag: true
  //         }
  //       }
  //     },
  //     where: {
  //       status: PASSAGE_STATUS.PENDING
  //     }
  //   })
  // }
}