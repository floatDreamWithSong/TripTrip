import { passwordSchema, UserInfo, UserLogin, usernameSchema } from '@triptrip/utils';
import { get, post } from './index';
import { storeTokens } from './index';
import { useUserStore } from '../store/user';

interface LoginPayLoad {
  accessToken: string;
  refreshToken: string;
  info: {
    _count: {
      Passage: number;
    }
    avatar: string;
    email: string;
    gender: number;
    registerTime: string;
    uid: number;
    username: string;
    userType: number;
  }
}

export const login = async (credentials: UserLogin) => {
  try {
    if(!credentials.username || !credentials.password)
      throw new Error('请输入用户名和密码')
    // 验证输入数据
    usernameSchema.parse(credentials.username)
    passwordSchema.parse(credentials.password)
    // 发送登录请求
    const response = await post<LoginPayLoad>('/user/login', credentials);
    // 存储token
    storeTokens(response.data.accessToken, response.data.refreshToken);

    return {
      success: true,
      data: response
    };
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      error: (function(){
        let zod_text = error
        console.log(zod_text)
        if (typeof error.format === 'function') {
            zod_text = error.format()?._errors?.join(';\n')
        }
        console.log(zod_text)
        return zod_text;
      })()
    };
  }
};

export const tryAutoAuthenticate = async () => {
  try {
    const response = await get<UserInfo>('/user/self');

    if (response.code === 0 && response.data) {
      useUserStore.getState().setUserInfo(response.data);
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: response.message
    };
  } catch (error: any) {
    console.error('Auto authenticate failed:', error);
    useUserStore.getState().clearUserInfo();
    return {
      success: false,
      error: error.message
    };
  }
}