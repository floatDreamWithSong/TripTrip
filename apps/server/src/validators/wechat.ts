import { z } from 'zod';
export const WeChatEncryptedDataSchema = z.object({
  // "avatar": z.union([z.null(), z.string()]).optional(),
  encryptedData: z.string(),
  iv: z.string(),
  // "name": z.union([z.null(), z.string()]).optional(),
});
export type WechatEncryptedDataDto = z.infer<typeof WeChatEncryptedDataSchema>;

export const WeChatOpenidSessionKeySchema = z.object({
  openid: z.string(),
  session_key: z.string(),
});

export type WeChatOpenidSessionKeyDto = z.infer<typeof WeChatOpenidSessionKeySchema>;