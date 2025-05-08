import { Container, Header, Content, Sidebar, Dropdown, Nav, Avatar } from 'rsuite';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { Moon, Sun } from 'lucide-react';
import { clearTokens } from '@/request';
import { useUserStore } from '../store/user';
import '../styles/DashboardLayout.css';

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
    <Container className="dashboard-container">
      <Header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <Link to="/dashboard/statistics">
              TripTrip
            </Link>
          </div>
          <div className="header-right">
            <div className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <Dropdown 
              placement="bottomEnd" 
              trigger={['click']} 
              title={
                <div className="user-info">
                  <span>{userInfo?.username}</span>
                  <span className="user-type-badge">
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
      <Container className="dashboard-body">
        <Sidebar className="dashboard-sidebar">
          <Nav vertical appearance="subtle" activeKey={location.pathname}>
            <Nav.Item eventKey="/dashboard/statistics" onSelect={() => navigate('/dashboard/statistics')}>
              数据统计
            </Nav.Item>
            <Nav.Item eventKey="/dashboard/review" onSelect={() => navigate('/dashboard/review')}>
              审核列表
            </Nav.Item>
          </Nav>
        </Sidebar>
        <Content className="dashboard-content">
          {children}
        </Content>
      </Container>
    </Container>
  );
};

export default DashboardLayout;