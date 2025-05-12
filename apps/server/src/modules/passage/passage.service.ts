import { Injectable, Logger } from "@nestjs/common";
import { JwtPayload, PASSAGE_STATUS, USER_TYPE } from "@triptrip/utils";
import { EXCEPTIONS } from "src/common/exceptions";
import { CosService } from "src/common/utils/cos/cos.service";
import { PrismaService } from "src/common/utils/prisma/prisma.service";
import { LikeService } from "../like/like.service";
import { Prisma } from "prisma-generated";
import { SchedulePassageService } from "../schedule/schedule.passage.service";

@Injectable()
export class PassageService {
    private readonly logger = new Logger(PassageService.name);
    constructor(private readonly cosService: CosService,
        private readonly prismaService: PrismaService,
        private readonly likeService: LikeService,
        private readonly schedulePassageService: SchedulePassageService) { }
    /**
     * 请求文章列表，只包括简略信息，包括请求者相对其的信息
     * @param page 
     * @param limit 
     * @param options 
     * @returns 
     */
    async getPassages(page: number, limit: number, options: {
        authorId?: number, status?: number, publishTime?: 'asc' | 'desc', userId?: number
    }) {
        const { authorId, userId, status, publishTime } = options;
        const passages = await this.prismaService.passage.findMany({
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
                authorId,// 如果有 authorId 则只返回该用户的文章
                status, // 如果有 status 则只返回该状态的文章
                isDeleted: false
            },
            omit: {
                reason: true,
                content: true,
                status: true,
                videoUrl: true,
                isDeleted: true
            }
        });

        // 获取实时点赞数据并覆盖
        const passagesWithRealTimeLikes = await Promise.all(passages.map(async (passage) => {
            const realTimeLikeCount = await this.likeService.getPassageLikeCount(passage.pid);
            const isLiked = userId ? await this.likeService.hasUserLikedPassage(userId, passage.pid) : false;
            return {
                ...passage,
                _count: {
                    ...passage._count,
                    passageLikes: realTimeLikeCount
                },
                passageLikes: isLiked ? [{ userId }] : []
            };
        }));

        return passagesWithRealTimeLikes;
    }
    /**
     * 获取一篇文章的详细信息，包括请求者自身相对其的情况，但是不包括审核情况
     * @param pid 
     * @returns 
     */
    async getOne(pid: number, userId?: number) {
        // 增加阅读量
        await this.prismaService.passage.update({
            where: { pid },
            data: {
                views: { increment: 1 }
            }
        });

        // 更新文章评分
        this.schedulePassageService.updatePassageRating(pid).catch(err => {
            this.logger.error(`更新文章评分失败，ID: ${pid}`, err);
        });

        const passage = await this.prismaService.passage.findUnique({
            where: { pid, isDeleted: false },
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
                status: true,
                isDeleted: true
            }
        });

        if (!passage) return null;

        // 获取实时点赞数据并覆盖
        const [realTimeLikeCount, isLiked] = await Promise.all([
            this.likeService.getPassageLikeCount(pid),
            userId ? this.likeService.hasUserLikedPassage(userId, pid) : false
        ]);
        return {
            ...passage,
            _count: {
                ...passage._count,
                passageLikes: realTimeLikeCount
            },
            passageLikes: isLiked ? [{ userId }] : []
        };
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
        if (user.userType !== USER_TYPE.ADMIN && passage.authorId !== user.uid) {
            throw EXCEPTIONS.PASSAGE_DELETE_FAILED
        }
        if (user.userType === USER_TYPE.ADMIN) {
            await this.prismaService.passage.update({
                where: { pid: passageId },
                data: { isDeleted: true }
            })
            return true;
        }
        return this.prismaService.$transaction(async (tx) => {
            // 删除文章关联的图片
            // 删除和文章关联的tag关联
            // 删除相关的评论
            // 删除相关的点赞
            // 删除相关的收藏

            await Promise.all([
                tx.passageImage.deleteMany({
                    where: { pid: passageId }
                }),
                tx.passageToTag.deleteMany({
                    where: { passageId: passageId }
                }),
                tx.comment.deleteMany({
                    where: { passageId: passageId }
                }),
                tx.passageLike.deleteMany({
                    where: { passageId: passageId }
                }),
                tx.favorite.deleteMany({
                    where: { passageId: passageId }
                })
            ])

            // 删除文章
            await tx.passage.delete({
                where: { pid: passageId }
            });


            // 删除COS上的图片
            const images = await tx.passageImage.findMany({
                where: { pid: passageId }
            });
            const promiseList: Promise<void>[] = images.map(image => this.cosService.deleteFileByUrl(image.url))
            // 删除COS上的视频
            if (passage.videoUrl) {
                promiseList.push(this.cosService.deleteFileByUrl(passage.videoUrl))
            }
            // 删除封面图
            if (passage.coverImageUrl) {
                promiseList.push(this.cosService.deleteFileByUrl(passage.coverImageUrl))
            }
            await Promise.all(promiseList)

            return true;
        })
    }
    /**
     * 搜索文章，支持按关键词搜索标题和内容，支持分类查询
     * @param page 页码
     * @param limit 每页数量
     * @param options 搜索选项
     * @returns 
     */
    async searchPassages(page: number, limit: number, options: {
        keyword?: string,
        tagId?: number,
        sortType?: 'hot' | 'latest' | 'comprehensive',
        userId?: number
    }) {
        const { keyword, tagId, sortType, userId } = options;

        // 构建基本查询条件
        const where: Prisma.PassageWhereInput = {
            status: PASSAGE_STATUS.APPROVED, // 只查询已审核通过的文章
            isDeleted: false,
        };

        // 如果有关键词，则搜索标题和内容
        if (keyword) {
            where.OR = [
                { title: { contains: keyword } },
                { content: { contains: keyword } }
            ];
        }

        // 如果有标签ID，则只查询包含该标签的文章
        if (tagId) {
            where.PassageToTag = {
                some: {
                    tagId
                }
            };
        }

        // 构建排序条件
        let orderBy: Prisma.PassageOrderByWithRelationInput | Prisma.PassageOrderByWithRelationInput[] = {};

        switch (sortType) {
            case 'hot':
                // 热点：按最近一段时间（7天内）新增点赞数量排序
                // 由于需要复杂计算，我们先获取所有符合条件的文章ID
                const hotPassageIds = await this.getHotPassageIds();
                if (hotPassageIds.length > 0) {
                    where.pid = { in: hotPassageIds };
                }
                // 默认按发布时间降序排序
                orderBy = { publishTime: 'desc' };
                break;
            case 'latest':
                // 最新：按发布时间排序
                orderBy = { publishTime: 'desc' };
                break;
            case 'comprehensive':
                // 综合：使用数据库中预先计算的rating字段排序
                orderBy = { rating: 'desc' };
                break;
            default:
                // 默认按发布时间降序排序
                orderBy = { publishTime: 'desc' };
                break;
        }

        // 查询文章列表
        const passages = await this.prismaService.passage.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where,
            orderBy,
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
            omit: {
                reason: true,
                content: true,
                status: true,
                videoUrl: true,
                isDeleted: true
            }
        });

        // 获取实时点赞数据并覆盖
        let passagesWithRealTimeLikes = await Promise.all(passages.map(async (passage) => {
            const [realTimeLikeCount, isLiked] = await Promise.all([
                this.likeService.getPassageLikeCount(passage.pid),
                userId ? this.likeService.hasUserLikedPassage(userId, passage.pid) : false
            ])
            return {
                ...passage,
                _count: {
                    ...passage._count,
                    passageLikes: realTimeLikeCount
                },
                passageLikes: isLiked ? [{ userId }] : []
            };
        }));

        // 计算总数
        const total = await this.prismaService.passage.count({ where });

        return {
            data: passagesWithRealTimeLikes,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * 获取热门文章ID列表（最近7天内点赞数最多的文章）
     * @returns 
     */
    private async getHotPassageIds(): Promise<number[]> {
        // 计算7天前的日期
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 查询最近7天内点赞数最多的文章
        const hotPassages = await this.prismaService.passageLike.groupBy({
            by: ['passageId'],
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            },
            _count: {
                passageId: true
            },
            orderBy: {
                _count: {
                    passageId: 'desc'
                }
            },
            take: 50 // 限制返回数量
        });

        return hotPassages.map(p => p.passageId);
    }

}