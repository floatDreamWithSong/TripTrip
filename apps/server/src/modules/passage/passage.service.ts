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
    /**
     * 请求文章列表，只包括简略信息，包括请求者相对其的信息
     * @param page 
     * @param limit 
     * @param options 
     * @returns 
     */
    getPassages(page: number, limit: number, options: {
        userId?: number, status?: number, publishTime?: 'asc' | 'desc'
    }) {
        const { userId, status, publishTime } = options;
        return this.prismaService.passage.findMany({
            skip: (page - 1) * limit,
            take: limit,
            include: {
                author: {
                    select: {
                        uid: true,
                        username: true,
                        avatar: true,
                        followers: {
                            where: {
                                followerId: userId // 检查当前用户是否关注了该作者
                            }
                        }
                    }
                },
                PassageToTag: {
                    select: {
                        tag: {
                            select: {
                                tid: true,
                                name: true
                            }
                        }
                    }
                },
                passageLikes: {
                    where: {
                        userId // 检查当前用户是否点赞了该文章
                    }
                },
                favorites: {
                    where: {
                        userId // 检查当前用户是否收藏了该文章
                    }
                },
                _count: { // 统计文章的评论数、点赞数、收藏数
                    select: {
                        comments: true,
                        favorites: true,
                        passageLikes: true
                    }
                }
            },
            orderBy: {
                publishTime: publishTime || 'desc' // 按照发布时间排序，默认为降序排序
            },
            where: {
                authorId: userId, // 如果有 userId 则只返回该用户的文章
                status // 如果有 status 则只返回该状态的文章
            },
            omit: {
                reason: true,
                content: true,
                status: true,
                videoUrl: true,
            }
        });
    }
    /**
     * 获取一篇文章的详细信息，包括请求者自身相对其的情况，但是不包括审核情况
     * @param pid 
     * @returns 
     */
    getOne(pid: number, userId?: number) {
        return this.prismaService.passage.findUnique({
            where: { pid },
            include: {
                author: {
                    select: {
                        uid: true,
                        username: true,
                        avatar: true,
                        followers: {
                            where: {
                                followerId: userId // 检查当前用户是否关注了该作者
                            }
                        }
                    }
                },
                images: {
                    select: {
                        url: true
                    }
                },
                PassageToTag: {
                    select: {
                        tag: {
                            select: {
                                tid: true,
                                name: true
                            }
                        }
                    }
                },
                passageLikes: {
                    where: {
                        userId // 检查当前用户是否点赞了该文章
                    }
                },
                favorites: {
                    where: {
                        userId // 检查当前用户是否收藏了该文章
                    }
                },
                _count: { // 统计文章的评论数、点赞数、收藏数
                    select: {
                        comments: true,
                        favorites: true,
                        passageLikes: true
                    }
                }
            },
            omit: {
                reason: true,
                status: true
            }
        })
    }
    /**
     * 删除文章，仅用户自身，管理员可操作
     * @param user 
     * @param passageId 
     * @returns 
     */
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
            // 删除相关的评论
            await tx.comment.deleteMany({
                where: { passageId: passageId }
            })
            // 删除相关的点赞
            await tx.passageLike.deleteMany({
                where: { passageId: passageId }
            })
            // 删除相关的收藏
            await tx.favorite.deleteMany({
                where: { passageId: passageId }
            })

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
            // 删除封面图
            if (passage.coverImageUrl) {
                await this.cosService.deleteFileByUrl(passage.coverImageUrl);
            }

            return true;
        })
    }
}