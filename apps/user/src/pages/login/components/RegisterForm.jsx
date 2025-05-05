import { View, Input, Button, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import '../index.scss';

const RegisterForm = ({ onBack, onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    if (!formData.email || !formData.username || !formData.password) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    // 这里可以添加发送验证码的逻辑
    setStep(2);
  };

  const handleCodeInput = (index, value) => {
    console.log('input!')
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // 输入数字时自动跳转到下一个输入框
    if (value && index < 5) {
      const nextInput = document.querySelectorAll(`.verification-code-inputer`)[index+1];
      console.log(nextInput)
      if (nextInput) nextInput.focus();
    }

    // 当验证码填写完整时自动提交
    if (newCode.every(digit => digit) && newCode.length === 6) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    console.log('delete')
    const keyCode = e.detail.keyCode
    console.log(e)
    // 处理删除键
    if (keyCode === 46 || keyCode === 8) {
      e.preventDefault();
      const newCode = [...verificationCode];
      
      // 如果当前输入框有值，清空当前输入框
      if (newCode[index]) {
        newCode[index] = '';
        setVerificationCode(newCode);
      } 
      // 如果当前输入框为空且不是第一个输入框，跳转到前一个输入框
      else if (index > 0) {
        const prevInput = document.querySelectorAll(`.verification-code-inputer`)[index-1];
        if (prevInput) {
          prevInput.focus();
          newCode[index - 1] = '';
          setVerificationCode(newCode);
        }
      }
    }
  };

  const handleSubmit = async (code) => {
    try {
      // 这里添加注册逻辑
      Taro.showToast({
        title: '注册成功',
        icon: 'success'
      });
      onBackToLogin();
    } catch (error) {
      Taro.showToast({
        title: '注册失败',
        icon: 'none'
      });
    }
  };

  return (
    <View className="register-form">
      <View className="back-button" onClick={()=>step === 1 ?onBackToLogin():setStep(1)}>←</View>
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
              index===0?(
                <Input
                key={index}
                className="code-input verification-code-inputer"
                type="number"
                maxlength={1}
                value={digit}
                data-index={index}
                focus
                onInput={(e) => handleCodeInput(index, e.detail.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
              ):(
              <Input
                key={index}
                className="code-input verification-code-inputer"
                type="number"
                maxlength={1}
                value={digit}
                data-index={index}
                onInput={(e) => handleCodeInput(index, e.detail.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />)
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default RegisterForm; 