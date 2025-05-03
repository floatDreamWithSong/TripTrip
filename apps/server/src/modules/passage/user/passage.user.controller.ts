import { Body, Controller, Get, HttpCode, HttpStatus, Logger, ParseIntPipe, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload, PageQuery, pageQuerySchema } from '@triptrip/utils';
import { EXCEPTIONS } from 'src/common/exceptions';
import { PassageUserService } from './passage.user.service';
import { PassageText, passageTextSchema } from '@triptrip/utils';
import { PassageService } from '../passage.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';

@Controller('passage/user')
export class PassageUserController {
  private readonly logger = new Logger(PassageUserController.name);
  static imageSizeLimit = 2 * 1024 * 1024; // 2MB
  static videoSizeLimit = 50 * 1024 * 1024; // 50MB
  constructor(private readonly passageUserService: PassageUserService,
    private readonly passageService: PassageService) { }
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
  ], {
    fileFilter: (req, file, callback) => {
      if (file.fieldname === 'images') {
        if (!file.mimetype.match(/image\/(jpeg|png|gif|webp)$/)) {
          return callback(EXCEPTIONS.INVALID_IMAGE_TYPE, false);
        }
      } else if (file.fieldname === 'video') {
        if (!file.mimetype.match(/video\/(mp4|webm|ogg|avi)$/)) {
          return callback(EXCEPTIONS.INVALID_VIDEO_TYPE, false);
        }
      }
      callback(null, true);
    }
  }))
  create(
    @Body(ZodValidationPipe.passageTextSchema) body: PassageText,
    @UploadedFiles() files: { images?: Express.Multer.File[], video?: Express.Multer.File[] },
    @User() user: JwtPayload
  ) {
    files.images?.forEach((image) => {
      if (image.size > PassageUserController.imageSizeLimit) {
        throw EXCEPTIONS.IMAGE_SIZE_EXCEEDED;
      }
    })
    files.video?.forEach((video) => {
      if (video.size > PassageUserController.videoSizeLimit) {
        throw EXCEPTIONS.VIDEO_SIZE_EXCEEDED;
      }
    })
    return this.passageUserService.createPassage({
      title: body.title,
      content: body.content,
      user: user,
      tags: body.tags,
      images: files?.images,
      video: files?.video?.[0]
    });
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@User() user: JwtPayload, @Body(ZodValidationPipe.passageTextSchema) body: PassageText) {
    // TODO: 用户修改文章
  }

  @Get()
  list(@User() user: JwtPayload, @Query(ZodValidationPipe.pageQuerySchema) query: PageQuery) {
    // 查看自己的文章
    return this.passageService.getPassages(query.page, query.limit, {
      userId: user.uid,
      publishTime:'desc'
    });
  }
  @Get('review')
  review(@User() user: JwtPayload, @Query('passageId', ParseIntPipe) passageId: number){
    // 查看自己的文章审核情况
    return this.passageUserService.getPassageReview(passageId, user.uid);
  }
  // @Delete('image')
  // @HttpCode(HttpStatus.OK)
  // deleteImage(@Us// ) use// JwtPayload, @Query('// geId', ParseIntPipe) imageId// umber) {
    
  // }
  // @Delete('video')
  // @HttpCode(HttpStatus.OK)
  // deleteVideo(@User()// er: JwtPayload, @Query('passageId', ParseIntPipe) passageId: number) {
    
  // }
}
