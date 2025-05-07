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
  /**
   *  获取文章详情
   * @param id 
   * @returns 
   */
  @Get()
  @Public()
  getOne(@Query('id', ParseIntPipe) id: number) {
    return this.passageService.getOne(id);
  }
  /**
   *  获取文章列表
   * @param query 
   * @param userId 
   * @returns 
   */
  @Get('list')
  @Public()
  list(@Query(ZodValidationPipe.pageQuerySchema) query: PageQuery, @Query('userId') userId?: number) {
    this.logger.debug(`query: ${JSON.stringify(query)}`);
    this.logger.debug(`userId: ${userId}`);
    if(userId){
      userId = parseInt(userId.toString());
    }
    return this.passageService.getPassages(query.page, query.limit, {
      userId: userId,
      status: PASSAGE_STATUS.APPROVED,
      publishTime: "desc"
    });
  }

  /**
   *  删除文章
   * @param user 
   * @param passageId 
   * @returns 
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  delete(@User() user: JwtPayload, @Query('passageId', ParseIntPipe) passageId: number) {
    return this.passageService.deletePassage(user, passageId);
  }
}