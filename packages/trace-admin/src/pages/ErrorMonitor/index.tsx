import React from 'react';
import { ConfigProvider, Tabs } from 'antd';
import type { TabsProps } from 'antd';
const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'JS运行异常',
    children: 'JS运行异常',
  },
  {
    key: '2',
    label: 'Promise异常',
    children: 'Promise异常',
  },
  {
    key: '3',
    label: '静态资源加载异常',
    children: '静态资源加载异常',
  },
  {
    key: '4',
    label: 'HTTP请求异常',
    children: 'HTTP请求异常',
  },
];

export default function ErrorMonitor() {
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
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </ConfigProvider>
    </div>
  );
}
