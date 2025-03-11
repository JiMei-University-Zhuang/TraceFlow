import React from 'react';
import { ConfigProvider, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { JsError } from './JsError';
import { PromiseError } from './PromiseError';
import { StaticResourceError } from './StaticResourceError';
import { HttpError } from './HttpError';
const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'JS运行异常',
    children: <JsError />,
  },
  {
    key: '2',
    label: 'Promise异常',
    children: <PromiseError />,
  },
  {
    key: '3',
    label: '静态资源加载异常',
    children: <StaticResourceError />,
  },
  {
    key: '4',
    label: 'HTTP请求异常',
    children: <HttpError />,
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
        <Tabs defaultActiveKey="1" centered items={items} onChange={onChange} />
      </ConfigProvider>
    </div>
  );
}
