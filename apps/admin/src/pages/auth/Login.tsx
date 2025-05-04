import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Content, Form, Button, Panel, Avatar, Dropdown, Header } from 'rsuite';
import { gsap } from 'gsap';
import { useThemeStore } from '../../store/theme';
import { Moon, Sun } from 'lucide-react';

const Login = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const isDarkMode = theme === 'dark';

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

  const handleSubmit = () => {
    // TODO: 实现登录逻辑
    navigate('/dashboard');
  };
  return (
    <Container>
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
              }}>
                登录
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
                    登录
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