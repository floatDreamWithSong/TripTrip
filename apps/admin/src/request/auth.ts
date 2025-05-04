import { UserLogin, userLoginSchema } from '@triptrip/utils';
import { get, post } from './index';
import { storeTokens } from './index';

interface LoginPayLoad {
  accessToken: string;
  refreshToken: string;
}

export const login = async (credentials: UserLogin) => {
  try {
    // 验证输入数据
    const validatedData = userLoginSchema.parse(credentials);
    
    // 发送登录请求
    const response = await post<LoginPayLoad>('/user/login', validatedData);
    // 存储token
    storeTokens(response.data.accessToken, response.data.refreshToken);
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '登录失败'
    };
  }
};
export const getPendingList = async(page:number, limit: number) =>{
    const res = await get('/passage/admin',{
        params:{
            page,
            limit
        }
    })
    console.log(res)
}