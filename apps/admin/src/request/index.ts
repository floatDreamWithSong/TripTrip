import { BaseResponse } from '@triptrip/utils';
import { getApiUrl } from '../config/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  retry?: boolean;
}

interface RequestError extends Error {
  status?: number;
}

const TOKEN_STORAGE_KEY = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

// 获取存储的token
export const getStoredTokens = () => {
  return {
    accessToken: localStorage.getItem(TOKEN_STORAGE_KEY.ACCESS_TOKEN),
    refreshToken: localStorage.getItem(TOKEN_STORAGE_KEY.REFRESH_TOKEN),
  };
};

// 存储token
export const storeTokens = (accessToken?: string, refreshToken?: string) => {
  if (accessToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY.ACCESS_TOKEN, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY.REFRESH_TOKEN, refreshToken);
  }
};

// 清除token
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_STORAGE_KEY.REFRESH_TOKEN);
};

// 基础请求函数
export const request = async <T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<BaseResponse<T>> => {
  const {
    method = 'GET',
    data,
    params,
    headers = {},
    retry = false,
  } = options;

  // 构建URL和查询参数
  let url = getApiUrl(path);
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // 获取token
  const { accessToken, refreshToken } = getStoredTokens();

  // 设置请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 添加访问令牌
  if (accessToken) {
    requestHeaders.Authorization = accessToken;
  }

  // 如果是重试请求，添加刷新令牌
  if (retry && refreshToken) {
    requestHeaders['X-Refresh-Token'] = refreshToken;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    // 检查新的访问令牌
    const newAccessToken = response.headers.get('X-Access-Token')?.toString();
    if(retry)
    if (newAccessToken) {
      storeTokens(newAccessToken);
    }

    if (!response.ok) {
      const error: RequestError = new Error('请求失败');
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    const err = error as RequestError;
    
    // 处理401未授权错误
    if (err.status === 401 && !retry) {
      // 尝试使用refreshToken重新请求
      return request<T>(path, { ...options, retry: true });
    }

    // 如果重试后仍然401，或者是其他错误
    if (err.status === 401) {
      clearTokens();
      throw new Error('请登录');
    }

    throw error;
  }
};

// 封装常用请求方法
export const get = <T = any>(path: string, options?: Omit<RequestOptions, 'method'>) => {
  return request<T>(path, { ...options, method: 'GET' });
};

export const post = <T = any>(path: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>) => {
  return request<T>(path, { ...options, method: 'POST', data });
};

export const put = <T = any>(path: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>) => {
  return request<T>(path, { ...options, method: 'PUT', data });
};

export const del = <T = any>(path: string, options?: Omit<RequestOptions, 'method'>) => {
  return request<T>(path, { ...options, method: 'DELETE' });
};
