import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Layout, Menu } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import { DashboardOutlined, BugOutlined, LineChartOutlined, UserSwitchOutlined } from '@ant-design/icons';
import './App.css';
import rawData from './data/db.json';
import RealtimeOverview from './pages/RealtimeOverview/index';
import ErrorMonitor from './pages/ErrorMonitor/index';
import PerformanceAnalysis from './pages/PerformanceAnalysis/index';
import UserBehavior from './pages/UserBehavior/index';
const { Sider, Content } = Layout;
const App = () => {
  const menuItems = [
    {
      key: '1',
      icon: _jsx(DashboardOutlined, { style: { fontSize: '1.2rem', color: 'white' } }),
      label: _jsx(Link, { to: '/', className: 'neon-link', children: '\u5B9E\u65F6\u6982\u89C8' }),
    },
    {
      key: '2',
      icon: _jsx(BugOutlined, { style: { fontSize: '1.2rem', color: 'white' } }),
      label: _jsx(Link, { to: '/errors', className: 'neon-link', children: '\u9519\u8BEF\u76D1\u63A7' }),
    },
    {
      key: '3',
      icon: _jsx(LineChartOutlined, { style: { fontSize: '1.2rem', color: 'white' } }),
      label: _jsx(Link, { to: '/performance', className: 'neon-link', children: '\u6027\u80FD\u5206\u6790' }),
    },
    {
      key: '4',
      icon: _jsx(UserSwitchOutlined, { style: { fontSize: '1.2rem', color: 'white' } }),
      label: _jsx(Link, { to: '/behavior', className: 'neon-link', children: '\u7528\u6237\u884C\u4E3A' }),
    },
  ];
  return _jsxs(Layout, {
    className: 'h-screen tech-bg',
    children: [
      _jsxs(Sider, {
        theme: 'dark',
        width: 240,
        breakpoint: 'lg',
        collapsedWidth: '0',
        style: {
          background: `#1A1A1A`,
        },
        children: [
          _jsx('div', { className: 'logo-container p-4 mb-4', children: _jsx('h1', { className: 'text-xl font-bold text-gradient', children: 'DATA INSIGHT' }) }),
          _jsx(Menu, {
            mode: 'inline',
            defaultSelectedKeys: ['1'],
            style: {
              background: 'transparent',
              borderRight: 'none',
              padding: '0 12px',
            },
            items: menuItems,
          }),
        ],
      }),
      _jsx(Layout, {
        children: _jsx(Content, {
          className: 'p-6 bg-opacity-90',
          style: { background: '#151515' },
          children: _jsxs(Routes, {
            children: [
              _jsx(Route, { path: '/', element: _jsx(RealtimeOverview, {}) }),
              _jsx(Route, { path: '/errors', element: _jsx(ErrorMonitor, {}) }),
              _jsx(Route, { path: '/performance', element: _jsx(PerformanceAnalysis, { metrics: rawData.performanceMetrics }) }),
              _jsx(Route, { path: '/behavior', element: _jsx(UserBehavior, {}) }),
            ],
          }),
        }),
      }),
    ],
  });
};
export default App;
