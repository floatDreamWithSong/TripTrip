export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'  // 开发环境
    : 'https://daydreamer.net.cn'  // 生产环境
} as const;

export const getApiUrl = (path: string): string => {
  return `${API_CONFIG.baseURL}${path.startsWith('/') ? path : `/${path}`}`;
};