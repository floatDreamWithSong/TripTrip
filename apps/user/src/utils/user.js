// src/utils/travelApi.js
import Taro from '@tarojs/taro';

export async function getUserInfo() {
  try {
    const Authorization = await Taro.getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '')
    const X_Refresh_Token = await Taro.getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '')

    const response = await Taro.request({
      url: 'https://daydreamer.net.cn/user/self', // 你的后端API地址
      method: 'GET',
      headers: {
        'Authorization': Authorization,
        'X-Refresh-Token': X_Refresh_Token,
      },
    });

    if (response.statusCode === 200) {
      console.log('获取用户信息成功', response.data);
      return response.data;
    } else {
      console.error('获取用户信息失败', response);
      throw new Error(response.data.message || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息请求错误:', error);
    throw error;
  }
}