import { Container, Header, Content, Sidebar, Dropdown, Nav, Avatar } from 'rsuite';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { Moon, Sun } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Container style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header style={{ flex: '0 0 auto', padding: '0 20px', borderBottom: '1px solid var(--rs-border-primary)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <div className="logo">
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              TripTrip
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div onClick={toggleTheme} style={{ cursor: 'pointer' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <Dropdown placement="bottomEnd" trigger={['click']} title={<Avatar circle />}>
              <Dropdown.Item onClick={() => navigate('/auth/login')}>退出登录</Dropdown.Item>
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