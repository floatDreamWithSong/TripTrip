import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Loader } from 'rsuite';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader size="lg" content="加载中..." vertical />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </DashboardLayout>
  );
};

export default Dashboard;