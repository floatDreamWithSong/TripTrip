import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AuthGuard } from './AuthGuard';

const Login = lazy(() => import('../pages/auth/Login'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Statistics = lazy(() => import('../pages/dashboard/Statistics'));
const ReviewList = lazy(() => import('../pages/dashboard/ReviewList'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <Navigate to="/dashboard" replace />
      </AuthGuard>
    ),
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Statistics />,
      },
      {
        path: 'statistics',
        element: <Statistics />,
      },
      {
        path: 'review',
        element: <ReviewList />,
      },
    ],
  },
]);