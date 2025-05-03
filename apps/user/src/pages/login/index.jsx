import { View, Input, Button } from '@tarojs/components';
import { useState } from 'react';
import { getCurrentUser, login } from '../../utils/request';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await login(username, password);
      console.log(res);
      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      });
      // 这里可以添加登录成功后的跳转逻辑
    } catch (error) {
      Taro.showToast({
        title: '登录失败',
        icon: 'none'
      });
    }
  };

  return (
    <View className="login-container">
      <Input 
        type="text" 
        placeholder="用户名" 
        value={username}
        onInput={(e) => setUsername(e.detail.value)}
      />
      <Input 
        type="password" 
        placeholder="密码" 
        value={password}
        onInput={(e) => setPassword(e.detail.value)}
      />
      <Button onClick={handleSubmit}>登录</Button>
      <Button onClick={getCurrentUser}>注册</Button>
    </View>
  );
}