import { ConfigProvider, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import VistMessages from './pages/VisitMessages/index';
import UserMessages from './pages/UserMessages/index';

const items: TabsProps['items'] = [
  {
    key: '1',
    label: '访问信息',
    children: <VistMessages />,
  },
  {
    key: '2',
    label: '用户信息',
    children: <UserMessages />,
  },
];

export default function UserBehavior() {
  // 组件逻辑
  return (
    // JSX内容
    <div>
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              itemColor: 'white',
            },
          },
        }}
      >
        <Tabs defaultActiveKey="1" centered items={items} />
      </ConfigProvider>
    </div>
  );
}
