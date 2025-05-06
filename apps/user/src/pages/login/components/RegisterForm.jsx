import { View, Input, Button, Text } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import '../index.scss';
import { getUserInfo, register, requestVerificationCode } from '../../../utils/request';
import { formErrorToaster } from '../../../utils/error';
import { z } from 'zod';

const RegisterForm = ({ onBack, onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [focusIndex, setFoucIndex] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    checkPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = async () => {
    await requestVerificationCode(formData)
      .then(setStep.bind(2))
      .catch(formErrorToaster)
  };

  const handleCodeInput = (index, value) => {
    if (!z.coerce.number().safeParse(value).success) return;
    index = focusIndex;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // 输入数字时自动跳转到下一个输入框
    if (index < 5) {
      console.log(value)
      const nextInput = document.querySelectorAll(`.verification-code-inputer`)[index + 1];
      console.log('nextInputer', nextInput)
      setFoucIndex(index + 1)
      nextInput.focus();
    }

    // 当验证码填写完整时自动提交
    if (newCode.every(digit => digit) && newCode.length === 6) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    index = focusIndex;
    const keyCode = e.detail.keyCode
    console.log(e)
    // 处理删除键
    if (keyCode === 46 || keyCode === 8) {
      e.preventDefault();
      const newCode = [...verificationCode];

      // 如果当前输入框有值，清空当前输入框
      if (newCode[index]) {
        console.log('delete', newCode[index])
        newCode[index] = '';
        setVerificationCode(newCode);
      }
      // 如果当前输入框为空且不是第一个输入框，跳转到前一个输入框
      else if (index > 0) {
        const prevInput = document.querySelectorAll(`.verification-code-inputer`)[index - 1];
        console.log('preInputer', prevInput)
        prevInput.focus();
        newCode[index - 1] = '';
        setVerificationCode(newCode);
        setFoucIndex(index - 1)
      }
    }
  };
  const checkPassword = () => new Promise(() => {
    console.log(formData.checkPassword, formData.password)
    if (formData.checkPassword != formData.password) {
      throw Error('密码不一致！')
    }
  }).catch(formErrorToaster)

  const handleSubmit = async (code) => {
    console.log(code)
    register({
      ...formData,
      verifyCode: code
    })
      .then(res => {
        Taro.showToast({
          title: '注册成功',
          icon: 'success'
        });
        Taro.navigateTo({
          url: 'pages/index/index'
        })
        onBackToLogin();
      })
      .catch(formErrorToaster)
  }
  return (
    <View className="register-form">
      <View className="back-button" onClick={() => step === 1 ? onBackToLogin() : setStep(1)}>←</View>
      {step === 1 ? (
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
            <Input
              className="input-field"
              type="password"
              placeholder="请设置密码"
              value={formData.password}
              onInput={(e) => handleInputChange('password', e.detail.value)}
            />
            <Input
              className="input-field"
              type="password"
              placeholder="请确认密码"
              onBlur={checkPassword}
              value={formData.checkPassword}
              onInput={(e) => handleInputChange('checkPassword', e.detail.value)}
            />
          </View>

          <Button className="next-button" onClick={handleNextStep}>
            下一步
            <View className="arrow-icon">→</View>
          </Button>
        </>
      ) : (
        <>
          <View className="form-header">
            <Text className="title">验证码</Text>
            <Text className="subtitle">验证码已发送至{formData.email}</Text>
          </View>

          <View className="verification-code-container">
            {verificationCode.map((digit, index) => (
              // index === 0 ? (
              //   <Input
              //     key={index}
              //     className="code-input verification-code-inputer"
              //     type="number"
              //     maxlength={1}
              //     value={digit}
              //     data-index={index}
              //     focus
              //     onInput={(e) => handleCodeInput(index, e.detail.value)}
              //     onKeyDown={(e) => handleKeyDown(index, e)}
              //   />
              // ) : (
                <Input
                  key={index}
                  className="code-input verification-code-inputer"
                  type="number"
                  maxlength={1}
                  value={digit}
                  data-index={index}
                  onInput={(e) => handleCodeInput(index, e.detail.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              // )
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default RegisterForm; 