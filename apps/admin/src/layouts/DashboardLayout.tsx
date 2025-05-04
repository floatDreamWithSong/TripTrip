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
    <Container>
      <Header>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
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
              <Dropdown.Item>设置</Dropdown.Item>
              <Dropdown.Item onClick={() => navigate('/auth/login')}>退出登录</Dropdown.Item>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Container>
        <Sidebar>
          <Nav vertical appearance="subtle" activeKey={location.pathname}>
            <Nav.Item eventKey="/dashboard/statistics" onSelect={() => navigate('/dashboard/statistics')}>
              数据统计
            </Nav.Item>
            <Nav.Item eventKey="/dashboard/review" onSelect={() => navigate('/dashboard/review')}>
              审核列表
            </Nav.Item>
          </Nav>
        </Sidebar>
        <Content>{children}</Content>
      </Container>
    </Container>
  );
};

export default DashboardLayout;