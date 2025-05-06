import { View, Input, Button, Text } from '@tarojs/components';
import { useState } from 'react';
import { getUserInfo, login } from '../../../utils/request';
import Taro from '@tarojs/taro';
import '../index.scss';
import { formErrorToaster } from '../../../utils/error';

const LoginForm = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      Taro.showToast({
        title: '请先同意服务协议',
        icon: 'none'
      });
      return;
    }
    login(username, password)
      .then(() => {
        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        });
        Taro.navigateTo({
          url: 'pages/index/index'
        })
      })
      .catch(formErrorToaster)

  };

  return (
    <View className="login-form">
      <View className="form-header">
        <Text className="title">TripTrip</Text>
        <Text className="subtitle">请登录您的账号</Text>
      </View>

      <View className="input-group">
        <Input
          className="input-field"
          type="text"
          placeholder="用户名"
          value={username}
          onInput={(e) => setUsername(e.detail.value)}
        />
        <Input
          className="input-field"
          type="password"
          placeholder="密码"
          value={password}
          onInput={(e) => setPassword(e.detail.value)}
        />
      </View>

      <View className="agreement">
        <View className="checkbox" onClick={() => setAgreed(!agreed)}>
          <View className={`checkbox-inner ${agreed ? 'checked' : ''}`} />
        </View>
        <Text className="agreement-text">我已阅读并同意<Text className="link">服务协议</Text>和<Text className="link">隐私政策</Text></Text>
      </View>

      <Button className="login-button" onClick={handleSubmit}>
        登录
        <View className="arrow-icon">→</View>
      </Button>

      <View className="footer">
        <Text className="register-link" onClick={onSwitchToRegister}>
          还没有账号？立即注册
        </Text>
      </View>
    </View>
  );
};

export default LoginForm; 