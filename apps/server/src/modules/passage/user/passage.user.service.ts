import { Injectable, Logger } from '@nestjs/common';
import { JwtPayload, PASSAGE_STATUS } from '@triptrip/utils';
import { CosService } from 'src/common/utils/cos/cos.service';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';

@Injectable()
export class PassageUserService {
  getPassageReview(passageId: number, uid: number) {
    return this.prismaService.passage.findUnique({
      where: {
        pid: passageId,
        authorId: uid,
      },
      select: {
        pid: true,
        title: true,
        status: true,
        reason: true,
      }
    })
  }

  private readonly logger = new Logger(PassageUserService.name);
  constructor(private readonly cosService: CosService,
    private readonly prismaService: PrismaService
  ) { }
  async createPassage(args: { title: string; content: string; user: JwtPayload; tags: string[]; images: Express.Multer.File[] | undefined; video: Express.Multer.File | undefined; }) {
    console.dir(args);
    const imagesUrls: string[] = [];
    for(const image of args.images ?? []) {
      imagesUrls.push(`https://${await this.cosService.uploadFile(image)}`);
    }
    const videoUrl = args.video ? `https://${await this.cosService.uploadFile(args.video)}` : undefined;
    
    return this.prismaService.$transaction(async (tx) => {
      // 创建文章记录
      const passage = await tx.passage.create({
        data: {
          title: args.title,
          content: args.content,
          authorId: args.user.uid,
          videoUrl: videoUrl,
          status: PASSAGE_STATUS.PENDING // 默认待审核状态
        }
      });
      
      // 保存图片记录
      for(const url of imagesUrls) {
        await tx.passageImage.create({
          data: {
            pid: passage.pid,
            url: url
          }
        });
      }
      
      // 处理标签关联
      for(const tagName of args.tags) {
        let tag = await tx.tag.findUnique({
          where: { name: tagName }
        });
        
        if(!tag) {
          tag = await tx.tag.create({
            data: { name: tagName }
          });
        }
        
        const existingRelation = await tx.passageToTag.findUnique({
          where: {
            passageId_tagId: {
              passageId: passage.pid,
              tagId: tag.tid
            }
          }
        });
        this.logger.debug(`existingRelation: ${existingRelation}`);
        if(!existingRelation) {
          await tx.passageToTag.create({
            data: {
              passageId: passage.pid,
              tagId: tag.tid
            }
          });
        }
      }
      
      return passage.pid;
    });
  }
}
