import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useRoutes } from 'react-router-dom';
import { DashboardOutlined, BugOutlined, LineChartOutlined, UserSwitchOutlined } from '@ant-design/icons';
import './App.css';
import logo from './assets/logo.png';
import router from './routes';

const { Sider, Content } = Layout;

const App: React.FC = () => {
  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined style={{ fontSize: '1.2rem', color: 'white' }} />,
      label: (
        <Link to="/" className="neon-link">
          实时概览
        </Link>
      ),
    },
    {
      key: '2',
      icon: <BugOutlined style={{ fontSize: '1.2rem', color: 'white' }} />,
      label: (
        <Link to="/errors" className="neon-link">
          错误监控
        </Link>
      ),
    },
    {
      key: '3',
      icon: <LineChartOutlined style={{ fontSize: '1.2rem', color: 'white' }} />,
      label: (
        <Link to="/performance" className="neon-link">
          性能分析
        </Link>
      ),
    },
    {
      key: '4',
      icon: <UserSwitchOutlined style={{ fontSize: '1.2rem', color: 'white' }} />,
      label: (
        <Link to="/behavior" className="neon-link">
          用户行为
        </Link>
      ),
    },
  ];
  const routes = useRoutes(router);
  return (
    <Layout className="h-screen tech-bg">
      <Sider
        theme="dark"
        width={240}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: `#1A1A1A`,
        }}
      >
        <div className="logo-container p-4 mb-4">
          <img className="logo-png" src={logo} />
          <h1 className="text-xl font-bold text-gradient">DATA INSIGHT</h1>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          style={{
            background: 'transparent',
            borderRight: 'none',
            padding: '0 12px',
          }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Content className="p-6 bg-opacity-90" style={{ background: '#151515' }}>
          {routes}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
