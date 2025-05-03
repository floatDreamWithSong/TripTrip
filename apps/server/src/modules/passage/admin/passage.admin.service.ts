import { Injectable, Logger } from "@nestjs/common";
import { PASSAGE_STATUS } from "@triptrip/utils";
import { PrismaService } from "src/common/utils/prisma/prisma.service";

@Injectable()
export class PassageAdminService {
  private readonly logger = new Logger(PassageAdminService.name);
  constructor(private readonly prismaService: PrismaService) { }

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