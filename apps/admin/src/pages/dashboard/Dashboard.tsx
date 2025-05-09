import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Loader } from 'rsuite';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="dashboard-loader-container">
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