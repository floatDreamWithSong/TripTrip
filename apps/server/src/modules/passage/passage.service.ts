import { Injectable, Logger } from "@nestjs/common";
import { JwtPayload, PASSAGE_STATUS, USER_TYPE } from "@triptrip/utils";
import { EXCEPTIONS } from "src/common/exceptions";
import { CosService } from "src/common/utils/cos/cos.service";
import { PrismaService } from "src/common/utils/prisma/prisma.service";

@Injectable()
export class PassageService {
    private readonly logger = new Logger(PassageService.name);
    constructor(private readonly cosService: CosService,
        private readonly prismaService: PrismaService) { }
    getPassages(page: number,limit: number,options:{
        userId?: number, status?: number, publishTime?: 'asc' | 'desc'
    } ) {

        return this.prismaService.passage.findMany({
            skip: (page - 1) * limit,
            take: limit,
            include: {
                author: {
                    select: {
                        uid: true,
                        username: true,
                        avatar: true
                    }
                },
                PassageImage: {
                    select: {
                        id: true,
                        url: true
                    }
                },
                PassageToTag: {
                    include: {
                        tag: true
                    }
                }
            },
            orderBy: {
                publishTime: options.publishTime || 'desc'
            },
            where: {
                authorId: options.userId,
                status: options.status
            },
            omit:{
                reason: true,
                content: true,
            }
        });
    }
    getOne(id: number) {
        return this.prismaService.passage.findUnique({
            where: { pid: id, },
            include: {
                PassageImage: {
                    select: {
                        id: true,
                        url: true
                    }
                },
                PassageToTag: {
                    include: {
                        tag: true
                    }
                },
                author: {
                    select: {
                        uid: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            omit: {
                reason: true,
            }
        })
    }
    async deletePassage(user: JwtPayload, passageId: number) {
        // 检查文章是否存在
        const passage = await this.prismaService.passage.findUnique({
            where: { pid: passageId }
        });
        if (!passage) {
            throw EXCEPTIONS.PASSAGE_NOT_FOUND
        }
        // 检查用户是否有权限删除文章
        if (user.type !== USER_TYPE.ADMIN && passage.authorId !== user.uid) {
            throw EXCEPTIONS.PASSAGE_DELETE_FAILED
        }
        return this.prismaService.$transaction(async (tx) => {
            // 删除文章关联的图片
            await tx.passageImage.deleteMany({
                where: { pid: passageId }
            });
            // 删除和文章关联的tag关联
            await tx.passageToTag.deleteMany({
                where: { passageId: passageId }
            });
            // 删除文章
            await tx.passage.delete({
                where: { pid: passageId }
            });


            // 删除COS上的图片
            const images = await tx.passageImage.findMany({
                where: { pid: passageId }
            });
            for (const image of images) {
                await this.cosService.deleteFileByUrl(image.url);
            }
            // 删除COS上的视频
            if (passage.videoUrl) {
                await this.cosService.deleteFileByUrl(passage.videoUrl);
            }

            return true;
        })
    }
}