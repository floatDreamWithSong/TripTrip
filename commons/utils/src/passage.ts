import { z } from "zod";

export const passageTagsSchema = z.array(z.string().min(2));
export const passageTextSchema = z.object({
    title: z.string().min(2),
    content: z.string().min(2),
    tags: passageTagsSchema,
})
export type PassageText = z.infer<typeof passageTextSchema>;
export const PASSAGE_STATUS = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
}
export const passageStatusSchema = z.union(
    [z.literal(PASSAGE_STATUS.APPROVED), z.literal(PASSAGE_STATUS.REJECTED)])
export const passageReviewSchema = z.object({
    pid: z.coerce.number(),
    status: passageStatusSchema,
    reason: z.string().min(3).optional(),
}).refine(data => data.status !== PASSAGE_STATUS.REJECTED || data.reason, {
    message: '拒绝时必须提供原因',
    path: ['reason']
})
export type PassageReview = z.infer<typeof passageReviewSchema>;
export const pageQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
})
export type PageQuery = z.infer<typeof pageQuerySchema>;