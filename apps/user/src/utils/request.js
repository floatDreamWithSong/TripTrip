import Taro from '@tarojs/taro';
import { userLoginSchema } from '@triptrip/utils'

let isRefreshingToken = false;

const getAccessToken = async () => {
  return await Taro.getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '');
};

const getRefreshToken = async () => {
  return await Taro.getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '');
};

export const request = async (url, method = 'GET', data = {}) => {
  const accessToken = await getAccessToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  console.log('accessToken', accessToken);
  headers['Authorization'] = accessToken;


  if (isRefreshingToken) {
    headers['x-refresh-token'] = await getRefreshToken();
    console.log('refreshToken', headers['x-refresh-token']);
  }
  console.log('request headers', headers);
  const res = await Taro.request({
    url: `http://localhost:3000/${url}`,
    method,
    data,
    header: headers
  })
  if (isRefreshingToken && res.header['x-access-token']) {
    Taro.setStorageSync('accessToken', res.header['x-access-token']);
  }
  if (res.statusCode === 401) {
    if (!isRefreshingToken) {
      isRefreshingToken = true;
      return await request(url, method, data).then(r=>{
        isRefreshingToken = false;
        return r;
      });
    } else {
      isRefreshingToken = false;
      Taro.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      });
      Taro.navigateTo({ url: '/pages/login/index' });
    }
  } else if(res.statusCode>=300||res.statusCode<200) {
    Taro.showToast({
      title: '请求失败',
      icon: 'none'
    });
  }else{
    Taro.showToast({
      icon: 'success',
      title: res.data.message
    })
  }
  return res
};

export const login = async (username, password) => {
  const data = userLoginSchema.parse({
    username,
    password
  });
  const { data: result } = await request('user/login', 'POST', data);
  console.log(result.data);
  Taro.setStorageSync('accessToken', result.data.accessToken);
  Taro.setStorageSync('refreshToken', result.data.refreshToken);
  return result;
};
export const getUserPassageStatus = async () => {
  return await request('passage/user/review?passageId=1', 'GET').then(console.log).catch(console.log);
}