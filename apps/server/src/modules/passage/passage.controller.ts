import { Controller, Delete, Get, HttpCode, HttpStatus, Logger, ParseIntPipe, Query } from "@nestjs/common";
import { PassageService } from "./passage.service";
import { Public } from "src/common/decorators/public.decorator";
import { JwtPayload, PageQuery, pageQuerySchema, PASSAGE_STATUS } from "@triptrip/utils";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validate.pipe";
import { ForceIdentity } from "src/common/decorators/forceIdentity.decorator";

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
  @ForceIdentity()
  getOne(@Query('id', ParseIntPipe) id: number, @User() user?: JwtPayload) {
    return this.passageService.getOne(id, user?.uid);
  }
  /**
   *  获取文章列表
   * @param query 
   * @param authorId 
   * @returns 
   */
  @Get('list')
  @Public()
  @ForceIdentity()
  list(@Query(ZodValidationPipe.pageQuerySchema) query: PageQuery, @Query('authorId') authorId?: number, @User() user?: JwtPayload) {
    this.logger.debug(`query: ${JSON.stringify(query)}`);
    this.logger.debug(`userId: ${authorId}`);
    if(authorId){
      authorId = parseInt(authorId.toString());
    }
    return this.passageService.getPassages(query.page, query.limit, {
      authorId,
      status: PASSAGE_STATUS.APPROVED,
      publishTime: "desc",
      userId: user?.uid
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

  /**
   * 搜索文章
   * @param query 分页参数
   * @param keyword 搜索关键词
   * @param tagId 标签ID
   * @param sortType 排序类型：hot(热点)、latest(最新)、comprehensive(综合)
   * @param user 当前用户信息
   * @returns 
   */
  @Get('search')
  @Public()
  @ForceIdentity()
  search(
    @Query(ZodValidationPipe.pageQuerySchema) query: PageQuery,
    @Query('keyword') keyword?: string,
    @Query('tagId') tagId?: number,
    @Query('sortType') sortType?: 'hot' | 'latest' | 'comprehensive',
    @User() user?: JwtPayload
  ) {
    this.logger.debug(`Search query: ${JSON.stringify({
      page: query.page,
      limit: query.limit,
      keyword,
      tagId,
      sortType,
      userId: user?.uid
    })}`);
    
    if (tagId) {
      tagId = parseInt(tagId.toString());
    }
    
    return this.passageService.searchPassages(
      query.page,
      query.limit,
      {
        keyword,
        tagId,
        sortType,
        userId: user?.uid
      }
    );
  }
}