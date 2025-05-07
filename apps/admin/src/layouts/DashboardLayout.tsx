import { Container, Header, Content, Sidebar, Dropdown, Nav, Avatar } from 'rsuite';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { Moon, Sun } from 'lucide-react';
import { clearTokens } from '@/request';
import { useUserStore } from '../store/user';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getUserType = (type: number) => {
  switch (type) {
    case 1:
      return '管理员';
    case 2:
      return '审核员';
    default:
      return '未知';
  }
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const userInfo = useUserStore(state => state.userInfo);
  
  const logout = () => {
    clearTokens()
    navigate('/auth/login')
  }

  return (
    <Container style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header style={{ flex: '0 0 auto', borderBottom: '1px solid var(--rs-border-primary)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <div className="logo" style={{
            fontSize:'large',
            fontWeight:'bold',
            fontFamily:'sans-serif',
            marginLeft:'20px'
          }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              TripTrip
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div onClick={toggleTheme} style={{ cursor: 'pointer' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <Dropdown 
              placement="bottomEnd" 
              trigger={['click']} 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{userInfo?.username}</span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'white',
                    backgroundColor: 'var(--rs-bg-active)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {userInfo && getUserType(userInfo.userType)}
                  </span>
                  <Avatar circle src={userInfo?.avatar || undefined} />
                </div>
              }
            >
              <Dropdown.Item onClick={logout}>退出登录</Dropdown.Item>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Container style={{ flex: '1 1 auto', display: 'flex', overflow: 'hidden' }}>
        <Sidebar style={{ 
          flex: '0 0 auto', 
          width: '200px',
          borderRight: '1px solid var(--rs-border-primary)',
          padding: '20px 0'
        }}>
          <Nav vertical appearance="subtle" activeKey={location.pathname}>
            <Nav.Item eventKey="/dashboard/statistics" onSelect={() => navigate('/dashboard/statistics')}>
              数据统计
            </Nav.Item>
            <Nav.Item eventKey="/dashboard/review" onSelect={() => navigate('/dashboard/review')}>
              审核列表
            </Nav.Item>
          </Nav>
        </Sidebar>
        <Content style={{ 
          flex: '1 1 auto',
          overflow: 'auto',
          padding: '20px'
        }}>
          {children}
        </Content>
      </Container>
    </Container>
  );
};

export default DashboardLayout;