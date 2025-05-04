import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';

const Login = lazy(() => import('../pages/auth/Login'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Statistics = lazy(() => import('../pages/dashboard/Statistics'));
const ReviewList = lazy(() => import('../pages/dashboard/ReviewList'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    children: [
      {
        path: '',
        element: <Navigate to="statistics" replace />,
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