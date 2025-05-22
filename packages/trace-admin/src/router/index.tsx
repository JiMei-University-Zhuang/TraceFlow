import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

import MainLayout from '@/layouts/MainLayout';

// 懒加载组件
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const PerformanceAnalysis = lazy(() => import('@/pages/PerformanceAnalysis'));
const UserBehavior = lazy(() => import('@/pages/UserBehavior'));
const Login = lazy(() => import('@/pages/login'));

// 加载中的组件
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <Spin size="large" tip="页面加载中..." />
  </div>
);

// 创建路由
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'performance',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <PerformanceAnalysis />
          </Suspense>
        ),
      },
      {
        path: 'behavior',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <UserBehavior />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <Login />
      </Suspense>
    ),
  },
]);

export default router;
