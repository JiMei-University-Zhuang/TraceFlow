import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import styles from './index.module.less';

const { Header, Content } = Layout;

const SimpleLayout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logo}>TraceFlow 监控平台</div>
      </Header>
      <Content
        className={styles.content}
        style={{
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default SimpleLayout;
