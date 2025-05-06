import { View } from '@tarojs/components';
import { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './index.scss';

export default function Login() {
  const [currentView, setCurrentView] = useState('login');

  return (
    <View className="login-container">
      {currentView === 'login' ? (
        <LoginForm onSwitchToRegister={() => setCurrentView('register')} />
      ) : (
        <RegisterForm onBackToLogin={() => setCurrentView('login')} />
      )}
    </View>
  );
}