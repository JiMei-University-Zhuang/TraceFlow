import React from 'react';
import { ConfigProvider, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { JsError } from './JsError';
import { PromiseError } from './PromiseError';
import { StaticResourceError } from './StaticResourceError';
import { HttpError } from './HttpError';
import { TimeSelector } from '@/components/selectHeader';
import createHeaderState from '@/store/createHeaderState';
const useTimeState = createHeaderState();
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
  const { timeState, onchangeTime } = useTimeState();

  return (
    // JSX内容
    <div>
      <div
        style={{
          position: 'fixed',
          top: 400,
          width: '100%',
          height: 96,
          zIndex: 1,
          background: '#333',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 0px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TimeSelector time={timeState} onChangeTime={onchangeTime}></TimeSelector>
      </div>
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
