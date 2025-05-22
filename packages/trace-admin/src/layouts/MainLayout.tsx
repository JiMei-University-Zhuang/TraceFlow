import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, BugOutlined, LineChartOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

// 导入样式
import styles from './MainLayout.less';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/errors',
      icon: <BugOutlined />,
      label: '错误监控',
    },
    {
      key: '/performance',
      icon: <LineChartOutlined />,
      label: '性能分析',
    },
    {
      key: '/behavior',
      icon: <UserOutlined />,
      label: '用户行为',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  // 当前选中的菜单项
  const selectedKeys = [location.pathname];

  // 菜单点击处理
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logo}>TraceFlow 监控平台</div>
      </Header>
      <Layout>
        <Sider width={200} className={styles.sider}>
          <Menu mode="inline" selectedKeys={selectedKeys} items={menuItems} onClick={handleMenuClick} className={styles.menu} />
        </Sider>
        <Layout className={styles.contentLayout}>
          <Content className={styles.content} style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
