import { Container, Header, Content, Sidebar, Dropdown, Nav, Avatar } from 'rsuite';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { clearTokens } from '@/request';
import { useUserStore } from '../store/user';
import '../styles/DashboardLayout.css';
import { useState, useEffect } from 'react';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
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
            <div className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </div>
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
        {isMobile && !sidebarCollapsed && (
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
        )}
        <Sidebar 
          className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}
        >
          <Nav vertical appearance="subtle" activeKey={location.pathname}>
            <Nav.Item eventKey="/dashboard/statistics" onSelect={() => navigate('/dashboard/statistics')}>
              数据统计
            </Nav.Item>
            <Nav.Item eventKey="/dashboard/review" onSelect={() => navigate('/dashboard/review')}>
              审核列表
            </Nav.Item>
          </Nav>
        </Sidebar>
        <Content className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
          {children}
        </Content>
      </Container>
    </Container>
  );
};

export default DashboardLayout;