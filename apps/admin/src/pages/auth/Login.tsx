import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Content, Form, Button, Panel, Message } from 'rsuite';
import { gsap } from 'gsap';
import { useRef } from 'react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    // TODO: 实现登录/注册逻辑
    navigate('/dashboard');
  };

  const toggleForm = () => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        y: '-100%',
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          setIsLogin(!isLogin);
          gsap.to(formRef.current, {
            y: '0%',
            opacity: 1,
            duration: 0.5,
          });
        },
      });
    }
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
          }}
        >
          <Panel header={<h3>{isLogin ? '登录' : '注册'}</h3>} bordered>
            <div ref={formRef}>
              <Form fluid onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.ControlLabel>用户名</Form.ControlLabel>
                  <Form.Control name="username" />
                </Form.Group>
                <Form.Group>
                  <Form.ControlLabel>密码</Form.ControlLabel>
                  <Form.Control name="password" type="password" />
                </Form.Group>
                <Form.Group>
                  <Button appearance="primary" type="submit" block>
                    {isLogin ? '登录' : '注册'}
                  </Button>
                </Form.Group>
                <Message onClick={toggleForm} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  {isLogin ? '前往注册' : '返回登录'}
                </Message>
              </Form>
            </div>
          </Panel>
        </div>
      </Content>
    </Container>
  );
};

export default Login;