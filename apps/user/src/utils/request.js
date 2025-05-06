import Taro from '@tarojs/taro';
import { emailSchema, passwordSchema, userLoginSchema, usernameSchema, userRegisterSchema, verificationCodeSchema } from '@triptrip/utils'
import { ZodError } from 'zod';
import { useUserStore } from '../store/user';

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
    url: `http://localhost:3000${url}`,
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
      const r = await request(url, method, data)
      isRefreshingToken = false;
      return r;
    } else {
      isRefreshingToken = false;
      Taro.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      });
      Taro.navigateTo({ url: '/pages/login/index' });
    }
  } else if (res.statusCode >= 300 || res.statusCode < 200 || res.data.code != 0) {
    throw Error(res.data.message)
  } else {
    Taro.showToast({
      icon: 'success',
      title: res.data.message
    })
  }
  console.log(res.data)
  return res
};

export const login = async (username, password) => {
  const data = {
    username: usernameSchema.parse(username),
    password: passwordSchema.parse(password)
  }
  const { data: result } = await request('/user/login', 'POST', data);
  Taro.setStorageSync('accessToken', result.data.accessToken);
  Taro.setStorageSync('refreshToken', result.data.refreshToken);
  useUserStore.getState().setUserInfo(result.data.info);
  return result;
};
export const requestVerificationCode = async (form) => {
  const data = {
    email: emailSchema.parse(form.email)
  }
  usernameSchema.parse(form.username)
  passwordSchema.parse(form.password)
  if(form.password!=form.checkPassword){
    throw Error('密码不一致！')
  }
  const { data: result } = await request('/user/code', 'POST', data)
  return result;
}
export const register = async (args) => {
  const data = {
    email: emailSchema.parse(args.email),
    username: usernameSchema.parse(args.username),
    password: passwordSchema.parse(args.password),
    verifyCode: verificationCodeSchema.parse(args.verifyCode)
  }
  if(data.password!=args.checkPassword){
    throw Error('密码不一致！')
  }
  const { data: result } = await request('/user/register', 'POST', data)
  Taro.setStorageSync('accessToken', result.data.accessToken);
  Taro.setStorageSync('refreshToken', result.data.refreshToken);
  useUserStore.getState().setUserInfo(result.data.info);
  return result;
}
