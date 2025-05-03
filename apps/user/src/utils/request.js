import Taro from '@tarojs/taro';
import {userLoginSchema} from '@triptrip/utils'

let isRefreshing = false;

const getAccessToken = async () => {
  return await Taro.getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '');
};

const getRefreshToken = async () => {
  return await Taro.getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '');
};

export const request = async (url, method = 'GET', data = {}, retry = false) => {
  try {
    const accessToken = await getAccessToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    console.log('accessToken',accessToken);
    headers['Authorization'] = accessToken;

    
    if (retry) {
      headers['x-refresh-token'] = await getRefreshToken();
      console.log('refreshToken', headers['x-refresh-token']);
    }
    console.log('headers', headers);
    const res = await Taro.request({
      url: `http://localhost:3000/${url}`,
      method,
      data,
      header: headers
    })
    console.log('retry',retry);
    if (retry && res.header['x-access-token']) {
      await Taro.setStorage({
        key: 'accessToken',
        data: res.header['x-access-token']
      });
    }
    
    return res.data;
  } catch (error) {
    console.error('Request error:', error);
    if (error.statusCode === 401 && !retry && !isRefreshing) {
      isRefreshing = true;
      try {
        const result = await request(url, method, data, true);
        isRefreshing = false;
        return result;
      } catch (refreshError) {
        isRefreshing = false;
        Taro.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none'
        });
        Taro.navigateTo({ url: '/pages/login/index' });
        throw refreshError;
      }
    } else {
      Taro.showToast({
        title: '请求失败',
        icon: 'none'
      });
      throw error;
    }
  }
};

export const login = async (username, password) => {
  const data = userLoginSchema.parse({
    username,
    password
  });
  const result = await request('user/login', 'POST', data);
  console.log(result.data);
  await Taro.setStorage({
    key: 'accessToken',
    data: result.data.accessToken
  });
  await Taro.setStorage({
    key: 'refreshToken',
    data: result.data.refreshToken
  });
  return result;
};
export const getCurrentUser = async () => {
  return await request('passage/user/review?passageId=1','GET').then(console.log).catch(console.log);
}