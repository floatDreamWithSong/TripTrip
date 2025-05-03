import { Controller, Delete, Get, HttpCode, HttpStatus, Logger, ParseIntPipe, Query } from "@nestjs/common";
import { PassageService } from "./passage.service";
import { Public } from "src/common/decorators/public.decorator";
import { JwtPayload, PageQuery, pageQuerySchema, PASSAGE_STATUS } from "@triptrip/utils";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validate.pipe";

@Controller('passage')
export class PassageController {
  private readonly logger = new Logger(PassageController.name);
  constructor(private readonly passageService: PassageService) {}
  @Get()
  @Public()
  getOne(@Query('id', ParseIntPipe) id: number) {
    return this.passageService.getOne(id);
  }

  @Get('list')
  @Public()
  list(@Query(ZodValidationPipe.pageQuerySchema) query: PageQuery, @Query('userId') userId?: number) {
    this.logger.debug(`query: ${JSON.stringify(query)}`);
    this.logger.debug(`userId: ${userId}`);
    if(userId){
      userId = parseInt(userId.toString());
    }
    // 公共视角下的文章列表
    return this.passageService.getPassages(query.page, query.limit, {
      userId: userId,
      status: PASSAGE_STATUS.APPROVED,
      publishTime: "desc"
    });
  }
  @Delete()
  @HttpCode(HttpStatus.OK)
  delete(@User() user: JwtPayload, @Query('passageId', ParseIntPipe) passageId: number) {
    return this.passageService.deletePassage(user, passageId);
  }
}