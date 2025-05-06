import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Put, Query } from '@nestjs/common';
import { UserType } from 'src/common/decorators/user-type.decorator';
import { JwtPayload, PageQuery, pageQuerySchema, PASSAGE_STATUS, PassageReview, passageReviewSchema, } from '@triptrip/utils';
import { PassageAdminService } from './passage.admin.service';
import { PassageService } from '../passage.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';
import { User } from 'src/common/decorators/user.decorator';

@Controller('passage/admin')
export class PassageAdminController {
  private readonly logger = new Logger(PassageAdminController.name);
  constructor(private readonly passageService: PassageService, private readonly passageAdminService: PassageAdminService) { }

  @Put()
  @HttpCode(HttpStatus.OK)
  @UserType('beyondUser')
  updateByAdmin(@Body(ZodValidationPipe.passageReviewSchema) body: PassageReview) {
    return this.passageAdminService.updateByAdmin(body.pid, body.status, body.reason);
  }
  @Get()
  @UserType('beyondUser')
  listForAdmin(@Query(ZodValidationPipe.pageQuerySchema) query: PageQuery) {
    return this.passageService.getPassages(query.page, query.limit, {
      status: PASSAGE_STATUS.PENDING,
      publishTime: 'asc'
    });
  }
  @Get('statistics')
  @UserType('beyondUser')
  getReviewStatistics() {
    return this.passageAdminService.getGlobalReviewStatistics();
  }
}
