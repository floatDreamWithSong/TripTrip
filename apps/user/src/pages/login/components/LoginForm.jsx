import { View, Input, Button, Text } from '@tarojs/components';
import { useState } from 'react';
import { getUserInfo, login } from '../../../utils/request';
import Taro from '@tarojs/taro';
import '../index.scss';
import { formErrorToaster } from '../../../utils/error';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const LoginForm = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      Taro.showToast({
        title: '请先同意服务协议',
        icon: 'none'
      });
      return;
    }
    
    setLoading(true);
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
      .finally(() => {
        setLoading(false);
      });
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisible = () => {
    setPasswordVisible(!passwordVisible);
  }

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
        <View className="password-input-container">
          <Input
            className="input-field"
            type={passwordVisible ? 'text' : 'password'}
            placeholder="密码"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
          <View className="password-visible-button" onClick={togglePasswordVisible}>
            {
              passwordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
          </View>
        </View>
      </View>

      <View className="agreement">
        <View className="checkbox" onClick={() => setAgreed(!agreed)}>
          <View className={`checkbox-inner ${agreed ? 'checked' : ''}`} />
        </View>
        <Text className="agreement-text">我已阅读并同意<Text className="link">服务协议</Text>和<Text className="link">隐私政策</Text></Text>
      </View>

      <Spin spinning={loading} indicator={<LoadingOutlined spin />} size="large">
        <Button className="login-button" onClick={handleSubmit} disabled={loading}>
          登录
          <View className="arrow-icon">→</View>
        </Button>
      </Spin>

      <View className="footer">
        <Text className="register-link" onClick={onSwitchToRegister}>
          还没有账号？立即注册
        </Text>
      </View>
    </View>
  );
};

export default LoginForm; 