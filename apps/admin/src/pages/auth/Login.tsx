import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Content, Form, Button, Panel, Message, useToaster } from 'rsuite';
import { gsap } from 'gsap';
import { useThemeStore } from '../../store/theme';
import { Moon, Sun } from 'lucide-react';
import { UserLogin } from '@triptrip/utils';
import { useMutation } from 'react-query';
import { login } from '../../request/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const toaster = useToaster();
  
  const isDarkMode = theme === 'dark';

  const loginMutation = useMutation(
    async (credentials: UserLogin) => {
      const result = await login(credentials);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    {
      onSuccess: () => {
        toaster.push(<Message type="success">登录成功</Message>);
        navigate('/dashboard');
      },
      onError: (error) => {
        toaster.push(<Message type="error">{error instanceof Error ? error.message : '登录失败'}</Message>);
      },
    }
  );

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  const handleSubmit =(formValue: Record<string, unknown> | null) => {
    if (!formValue) return;
    
    const payload = {
      username: formValue.username as string,
      password: formValue.password as string,
    };
    loginMutation.mutate(payload);
  };

  return (
    <Container>
      <AnimatePresence>
        {loginMutation.isLoading && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ width: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '3px',
              background: '#1890ff',
              zIndex: 1000,
            }}
          />
        )}
      </AnimatePresence>
      <Content>
        <div
          style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
            transition: 'background 0.3s ease',
          }}
        >
          <div ref={formRef}>
            <Panel
              bordered
              style={{
                background: isDarkMode ? '#2a2a2a' : '#ffffff',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                padding: '30px',
                width: '380px',
                boxShadow: isDarkMode
                  ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                  : '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              <h2 style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: isDarkMode ? '#ffffff' : '#333333',
                fontSize: '28px',
                fontWeight: 'bold',
                transition: 'color 0.3s ease',
                userSelect:'none'
              }}>
                登录TripTrip！
              </h2>
              <div style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                  marginTop: '20px'
                }}>
                  <Button appearance='subtle' onClick={toggleTheme} style={{
                    color: isDarkMode ? '#999999' : '#666666',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.3s ease',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    flexDirection:'column',
                    cursor:'pointer',
                  }}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  </Button>
                </div>
              <Form fluid onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.ControlLabel style={{
                    color: isDarkMode ? '#cccccc' : '#666666',
                    transition: 'color 0.3s ease',
                  }}>
                    用户名
                  </Form.ControlLabel>
                  <Form.Control
                    name="username"
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                    }}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.ControlLabel style={{
                    color: isDarkMode ? '#cccccc' : '#666666',
                    transition: 'color 0.3s ease',
                  }}>
                    密码
                  </Form.ControlLabel>
                  <Form.Control
                    name="password"
                    type="password"
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                    }}
                  />
                </Form.Group>
                <Form.Group style={{ marginTop: '30px' }}>
                  <Button
                    appearance="primary"
                    type="submit"
                    block
                    disabled={loginMutation.isLoading}
                    style={{
                      height: '44px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      background: isDarkMode ? '#4a4a4a' : '#2a2a2a',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {loginMutation.isLoading ? '登录中...' : '登录'}
                  </Button>
                </Form.Group>
              </Form>
            </Panel>
          </div>
        </div>
      </Content>
    </Container>
  );
};
export default Login;