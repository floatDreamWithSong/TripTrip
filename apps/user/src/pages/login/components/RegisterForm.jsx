import { View, Input, Button, Text } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import '../index.scss';
import { register, requestVerificationCode } from '../../../utils/auth';
import { formErrorToaster } from '../../../utils/error';
import { z } from 'zod';
import { Spin } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons';

// 常量定义
const STEPS = {
  REGISTER_FORM: 1,
  VERIFICATION_CODE: 2
};

const VERIFICATION_CODE_LENGTH = 6;
const KEY_CODES = {
  DELETE: 46,
  BACKSPACE: 8
};

const RegisterForm = ({ onBack, onBackToLogin }) => {
  const [step, setStep] = useState(STEPS.REGISTER_FORM);
  const [focusIndex, setFocusIndex] = useState(0);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    checkPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState(Array(VERIFICATION_CODE_LENGTH).fill(''));

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = async () => {
    setLoadingVerify(true);
    try {
      await requestVerificationCode(formData);
      setStep(STEPS.VERIFICATION_CODE);
    } catch (error) {
      formErrorToaster(error);
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleCodeInput = (index, value) => {
    if (!z.coerce.number().safeParse(value).success) return;
    
    index = focusIndex;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // 输入数字时自动跳转到下一个输入框
    if (index < VERIFICATION_CODE_LENGTH - 1) {
      const nextInput = document.querySelectorAll(`.verification-code-inputer`)[index + 1];
      setFocusIndex(index + 1);
      nextInput.focus();
    }

    // 当验证码填写完整时自动提交
    if (newCode.every(digit => digit) && newCode.length === VERIFICATION_CODE_LENGTH) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    index = focusIndex;
    const keyCode = e.detail.keyCode;
    
    // 处理删除键
    if (keyCode === KEY_CODES.DELETE || keyCode === KEY_CODES.BACKSPACE) {
      e.preventDefault();
      const newCode = [...verificationCode];

      // 如果当前输入框有值，清空当前输入框
      if (newCode[index]) {
        newCode[index] = '';
        setVerificationCode(newCode);
      }
      // 如果当前输入框为空且不是第一个输入框，跳转到前一个输入框
      else if (index > 0) {
        const prevInput = document.querySelectorAll(`.verification-code-inputer`)[index - 1];
        prevInput.focus();
        newCode[index - 1] = '';
        setVerificationCode(newCode);
        setFocusIndex(index - 1);
      }
    }
  };
  
  const checkPassword = async () => {
    try {
      return await new Promise((resolve, reject) => {
        if (formData.checkPassword !== formData.password) {
          reject(new Error('密码不一致！'));
        } else {
          resolve();
        }
      });
    } catch (error) {
      return formErrorToaster(error);
    }
  };

  const handleSubmit = async (code) => {
    setLoadingRegister(true);
    try {
      await register({
        ...formData,
        verifyCode: code
      });
      
      Taro.showToast({
        title: '注册成功',
        icon: 'success'
      });
      
      Taro.navigateTo({
        url: 'pages/index/index'
      });
      
      onBackToLogin();
    } catch (error) {
      formErrorToaster(error);
    } finally {
      setLoadingRegister(false);
    }
  };
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const togglePasswordVisible = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const toggleConfirmPasswordVisible = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };
  
  const renderRegisterForm = () => (
    <>
      <View className="form-header">
        <Text className="title">创建账号</Text>
      </View>
      <View className="input-group">
        <Input
          className="input-field"
          type="text"
          placeholder="请输入邮箱"
          value={formData.email}
          onInput={(e) => handleInputChange('email', e.detail.value)}
        />
        <Input
          className="input-field"
          type="text"
          placeholder="请输入用户名"
          value={formData.username}
          onInput={(e) => handleInputChange('username', e.detail.value)}
        />
        <View className="password-input-container">
          <Input
            className="input-field"
            type={passwordVisible ? 'text' : 'password'}
            placeholder="请设置密码"
            value={formData.password}
            onInput={(e) => handleInputChange('password', e.detail.value)}
          />
          <View className="password-visible-button" onClick={togglePasswordVisible}>
            {passwordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </View>
        </View>
        <View className="password-input-container">
          <Input
            className="input-field"
            type={confirmPasswordVisible ? 'text' : 'password'}
            placeholder="请确认密码"
            onBlur={checkPassword}
            value={formData.checkPassword}
            onInput={(e) => handleInputChange('checkPassword', e.detail.value)}
          />
          <View className="password-visible-button" onClick={toggleConfirmPasswordVisible}>
            {confirmPasswordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </View>
        </View>
      </View>
      <Spin spinning={loadingVerify} indicator={<LoadingOutlined spin />} size="large">
        <Button className="next-button" onClick={handleNextStep} disabled={loadingVerify}>
          下一步
          <View className="arrow-icon">→</View>
        </Button>
      </Spin>
    </>
  );
  
  const renderVerificationCodeForm = () => (
    <>
      <View className="form-header">
        <Text className="title">验证码</Text>
        <Text className="subtitle">验证码已发送至{formData.email}</Text>
      </View>

      <Spin spinning={loadingRegister} indicator={<LoadingOutlined spin />} size="large">
        <View className="verification-code-container">
          {verificationCode.map((digit, index) => (
            <Input
              key={index}
              className="code-input verification-code-inputer"
              type="number"
              maxlength={1}
              value={digit}
              data-index={index}
              onInput={(e) => handleCodeInput(index, e.detail.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loadingRegister}
            />
          ))}
        </View>
      </Spin>
    </>
  );
  
  return (
    <View className="register-form">
      <View className="back-button" onClick={() => step === STEPS.REGISTER_FORM ? onBackToLogin() : setStep(STEPS.REGISTER_FORM)}>←</View>
      {step === STEPS.REGISTER_FORM ? renderRegisterForm() : renderVerificationCodeForm()}
    </View>
  );
};

export default RegisterForm; 