import React from 'react';
import { Table, ConfigProvider } from 'antd';
import type { TableProps } from 'antd';

interface ErrorType {
  fileName: string;
  Info: string;
  time: string;
  eventNumber: number;
  userNumber: number;
}
const columns: TableProps<ErrorType>['columns'] = [
  {
    title: '异常静态资源',
    dataIndex: 'fileName',
    key: 'fileName',
  },
  {
    title: '错误信息',
    dataIndex: 'Info',
    key: 'Info',
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: '事件数',
    dataIndex: 'eventNumber',
    key: 'eventNumber',
  },
  {
    title: '用户数',
    dataIndex: 'userNumber',
    key: 'userNumber',
  },
];

const ErrorData: ErrorType[] = [
  {
    fileName: 'index.js',
    Info: 'Uncaught TypeError:Cannot read property of undefined',
    time: '7/21/2021. 14:31:22',
    eventNumber: 160,
    userNumber: 105,
  },
  {
    fileName: 'index.js',
    Info: 'Uncaught TypeError:Cannot read property of undefined',
    time: '7/21/2021. 14:31:22',
    eventNumber: 160,
    userNumber: 105,
  },
  {
    fileName: 'index.js',
    Info: 'Uncaught TypeError:Cannot read property of undefined',
    time: '7/21/2021. 14:31:22',
    eventNumber: 160,
    userNumber: 105,
  },
  {
    fileName: 'index.js',
    Info: 'Uncaught TypeError:Cannot read property of undefined',
    time: '7/21/2021. 14:31:22',
    eventNumber: 160,
    userNumber: 105,
  },
  {
    fileName: 'index.js',
    Info: 'Uncaught TypeError:Cannot read property of undefined',
    time: '7/21/2021. 14:31:22',
    eventNumber: 160,
    userNumber: 105,
  },
];
export const StaticResourceError = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            colorBgContainer: '#2B2B2B',
            colorText: 'white',
            colorTextHeading: 'white',
            borderColor: 'white',
          },
        },
      }}
    >
      <Table<ErrorType> columns={columns} dataSource={ErrorData} />
    </ConfigProvider>
  );
};
