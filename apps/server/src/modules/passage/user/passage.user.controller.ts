import { Body, Controller, Get, HttpCode, HttpStatus, Logger, ParseIntPipe, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload, PageQuery, pageQuerySchema } from '@triptrip/utils';
import { PassageUserService } from './passage.user.service';
import { PassageText, passageTextSchema } from '@triptrip/utils';
import { PassageService } from '../passage.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';
import { UploadFilter } from 'src/common/utils/upload/upload.filter';
import { z } from 'zod';

@Controller('passage/user')
export class PassageUserController {
  private readonly logger = new Logger(PassageUserController.name);

  constructor(private readonly passageUserService: PassageUserService, private readonly passageService: PassageService) { }
  /**
   *  创建文章
   * @param body 
   * @param files 
   * @param user 
   * @returns 
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ], {
    fileFilter: (req, file, callback) => UploadFilter.fileFilter(file.fieldname, file, callback)
  }))
  async create(
    @Body(ZodValidationPipe.passageTextSchema) body: PassageText,
    @UploadedFiles() files: {
      images?: Express.Multer.File[],
      video?: Express.Multer.File[],
      cover: Express.Multer.File[]
    },
    @User() user: JwtPayload
  ) {
    UploadFilter.validateFileSize(files);
    return this.passageUserService.createPassage({
      title: body.title,
      content: body.content,
      user: user,
      tags: body.tags,
      images: files.images,
      video: files.video? files.video[0]: undefined,
      coverImage: files.cover[0]
    });
  }

  /**
   *  修改文章
   * @param user 
   * @param body 
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  update(@User() user: JwtPayload, @Body(ZodValidationPipe.passageTextSchema) body: PassageText) {
    // TODO: 用户修改文章
  }

  /**
   *  用户获取自己的所有文章，包括所有状态的文章
   * @param user 
   * @param query 
   * @returns 
   */
  @Get()
  async list(@User() user: JwtPayload, @Query(ZodValidationPipe.pageQuerySchema) query: PageQuery, @Query('status') status?: number) {
    // 查看自己的文章
    return this.passageService.getPassages(query.page, query.limit, {
      authorId: user.uid,
      publishTime: 'desc',
      status: z.coerce.number().optional().parse(status)
    });
  }
  /**
   *  用户获取自己的文章审核详情
   * @param user 
   * @param passageId 
   * @returns 
   */
  @Get('review')
  async review(@User() user: JwtPayload, @Query('passageId', ParseIntPipe) passageId: number) {
    // 查看自己的文章审核情况
    return this.passageUserService.getPassageReview(passageId, user.uid);
  }
}
