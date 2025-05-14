import { Injectable, Logger } from '@nestjs/common';
import { JwtPayload, PASSAGE_STATUS } from '@triptrip/utils';
import { EXCEPTIONS } from 'src/common/exceptions';
import { CosService } from 'src/common/utils/cos/cos.service';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';

@Injectable()
export class PassageUserService {
  async updatePassage(pid: number,
    arg1: {
      title: string; content: string; tags: string[];
      uid: number;
      coverImage?: Express.Multer.File;
      images?: Express.Multer.File[];
      video?: Express.Multer.File;
      deleteImagesIds?: number[];
    }) {
    const { title, content, tags, images, video, coverImage, deleteImagesIds, uid } = arg1;
    const passage = await this.prismaService.passage.findUnique({
      where: {
        pid: pid,
        isDeleted: false,
      },
      include: {
        images: true,
      },
    });
    if (!passage) {
      throw EXCEPTIONS.PASSAGE_NOT_FOUND;
    }
    if (passage.authorId !== uid) {
      throw new Error('无权限');
    }
    if (passage.status === PASSAGE_STATUS.APPROVED) {
      throw new Error('文章已审核，无法修改');
    }
    const imagesUrls: string[] = [];
    for (const image of images ?? []) {
      imagesUrls.push(`https://${await this.cosService.uploadFile(image)}`);
    }
    const coverImageUrl = coverImage ? `https://${await this.cosService.uploadFile(coverImage)}` : undefined;
    const videoUrl = video ? `https://${await this.cosService.uploadFile(video)}` : undefined;
    await this.prismaService.$transaction(async (tx) => {
      // 首先删除图片
      console.log(deleteImagesIds);
      if (deleteImagesIds && Array.isArray(deleteImagesIds)) {
        await tx.passageImage.deleteMany({
          where: { pid: pid, id: { in: deleteImagesIds } }
        });
      }
      // 创建图片记录
      await tx.passageImage.createMany({
        data: imagesUrls.map(url => ({ pid, url }))
      });
      // 移除原来的标签
      await tx.passageToTag.deleteMany({
        where: { passageId: pid }
      });
      // 处理新的标签
      // for (const tagName of tags) {
      await Promise.all(tags.map(async (tagName) => {
        let tag = await tx.tag.findUnique({
          where: { name: tagName }
        });
        if (!tag) {
          tag = await tx.tag.create({
            data: { name: tagName }
          });
        }
        await tx.passageToTag.create({
          data: { passageId: pid, tagId: tag.tid }
        });
      }));
      // 更新文章
      await tx.passage.update({
        where: { pid },
        data: { title, content, coverImageUrl, videoUrl }
      });

    });
    const promiseList: Promise<void>[] = passage.images
      .filter(image => deleteImagesIds?.includes(image.id))
      .map(image => this.cosService.deleteFileByUrl(image.url))
    if (coverImage !== undefined && passage.coverImageUrl) {
      promiseList.push(this.cosService.deleteFileByUrl(passage.coverImageUrl))
    }
    if (video !== undefined && passage.videoUrl) {
      promiseList.push(this.cosService.deleteFileByUrl(passage.videoUrl))
    }
    await Promise.all(promiseList)
    return 'success';
  }
  private readonly logger = new Logger(PassageUserService.name);
  constructor(private readonly cosService: CosService, private readonly prismaService: PrismaService) { }

  /**
   *  获取用户文章审核记录
   * @param passageId 
   * @param uid 
   * @returns 
   */
  getPassageReview(passageId: number, uid: number) {
    return this.prismaService.passage.findUnique({
      where: {
        pid: passageId,
        authorId: uid,
        isDeleted: false
      },
      select: {
        pid: true,
        title: true,
        status: true,
        reason: true,
      }
    })
  }
  /**
   *  创建文章
   *  必须包含封面图，标题，内容，用户信息
   * @param args 
   * @returns 
   */
  async createPassage(args: {
    title: string;
    content: string;
    user: JwtPayload;
    coverImage: Express.Multer.File;
    tags?: string[];
    images?: Express.Multer.File[];
    video?: Express.Multer.File;
  }) {
    console.dir(args);
    const imagesUrls: string[] = [];
    for (const image of args.images ?? []) {
      imagesUrls.push(`https://${await this.cosService.uploadFile(image)}`);
    }
    const coverImageUrl = `https://${await this.cosService.uploadFile(args.coverImage)}`;
    const videoUrl = args.video ? `https://${await this.cosService.uploadFile(args.video)}` : undefined;

    return this.prismaService.$transaction(async (tx) => {
      // 创建文章记录
      const passage = await tx.passage.create({
        data: {
          title: args.title,
          content: args.content,
          authorId: args.user.uid,
          videoUrl: videoUrl,
          coverImageUrl: coverImageUrl,
          status: PASSAGE_STATUS.PENDING // 默认待审核状态
        }
      });

      // 保存图片记录
      for (const url of imagesUrls) {
        await tx.passageImage.create({
          data: {
            pid: passage.pid,
            url: url
          }
        });
      }

      // 处理标签关联
      if (args.tags) {
        await Promise.all(args.tags.map(async (tagName) => {
          let tag = await tx.tag.findUnique({
            where: { name: tagName }
        });

        if (!tag) {
          tag = await tx.tag.create({
            data: { name: tagName }
          });
        }
        await tx.passageToTag.create({
          data: {
            passageId: passage.pid,
            tagId: tag.tid
          }
          });
        }));
      }

      return passage.pid;
    });
  }
}
