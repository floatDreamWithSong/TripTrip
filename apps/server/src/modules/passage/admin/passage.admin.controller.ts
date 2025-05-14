import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Put, Query } from '@nestjs/common';
import { UserType } from 'src/common/decorators/user-type.decorator';
import { JwtPayload, PageQuery,  PASSAGE_STATUS, PassageReview } from '@triptrip/utils';
import { PassageAdminService } from './passage.admin.service';
import { PassageService } from '../passage.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';
import { z } from 'zod';

@Controller('passage/admin')
export class PassageAdminController {
  private readonly logger = new Logger(PassageAdminController.name);
  constructor(private readonly passageService: PassageService, private readonly passageAdminService: PassageAdminService) { }

  /**
   * 管理员审核文章
   * @param body 
   * @returns 
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  @UserType('beyondUser')
  async updateByAdmin(@Body(ZodValidationPipe.passageReviewSchema) body: PassageReview) {
    return this.passageAdminService.updateByAdmin(body.pid, body.status, body.reason);
  }
  /**
   *  获取文章列表
   * @param query 
   * @returns 
   */
  @Get()
  @UserType('beyondUser')
  async listForAdmin(@Query(ZodValidationPipe.pageQuerySchema) query: PageQuery, 
  @Query('status', new ZodValidationPipe(z.coerce.number().min(0).max(2).default(PASSAGE_STATUS.PENDING))) status: number) {
    return this.passageService.getPassages(query.page, query.limit, {
      status,
      publishTime: 'asc'
    });
  }
  /**
   *  获取文章审核统计数据
   * @returns 
   */
  @Get('statistics')
  @UserType('beyondUser')
  async getReviewStatistics() {
    return this.passageAdminService.getGlobalReviewStatistics();
  }
}
