export interface WechatLoginParams {
  code: string;
}

export interface WechatUserInfo {
  openid: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface WechatDecryptDataLike {
    watermark: {
      timestamp: number;
      appid: string;
    };
  }  