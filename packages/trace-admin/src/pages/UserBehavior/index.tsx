import React from 'react';
import { ConfigProvider, Tabs, Tooltip } from 'antd';
import { UserOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import VistMessages from './pages/VisitMessages/index';
import UserMessages from './pages/UserMessages/index';
import styles from './index.module.less';

const items: TabsProps['items'] = [
  {
    key: '1',
    label: (
      <span>
        <EyeOutlined style={{ marginRight: 8 }} />
        访问信息
      </span>
    ),
    children: (
      <div className={styles.tabContent}>
        <VistMessages />
      </div>
    ),
  },
  {
    key: '2',
    label: (
      <span>
        <UserOutlined style={{ marginRight: 8 }} />
        用户信息
      </span>
    ),
    children: (
      <div className={styles.tabContent}>
        <UserMessages />
      </div>
    ),
  },
];

const UserBehavior: React.FC = () => {
  // 页面标题
  const renderTitle = () => (
    <div className={styles.title}>
      用户行为分析
      <span className={styles.subtitle}>
        追踪用户访问路径与交互行为
        <Tooltip title="分析用户访问信息和行为数据，了解用户如何与您的应用交互。">
          <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
        </Tooltip>
      </span>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>{renderTitle()}</div>
      <div className={styles.tabsContainer}>
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                inkBarColor: '#1890ff',
                itemHoverColor: '#1890ff',
                itemSelectedColor: '#1890ff',
              },
            },
          }}
        >
          <Tabs defaultActiveKey="1" size="large" tabBarGutter={24} items={items} />
        </ConfigProvider>
      </div>
    </div>
  );
};

export default UserBehavior;
