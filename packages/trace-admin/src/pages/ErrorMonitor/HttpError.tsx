import React from 'react';
import { Table, ConfigProvider } from 'antd';
import type { TableProps } from 'antd';

interface ErrorType {
  interfaceNumber: number;
  info: string;
  statusCode: number;
  time: string;
  requestTime: string;
  params: string;
  eventNumber: number;
  userNumber: number;
}
const columns: TableProps<ErrorType>['columns'] = [
  {
    title: '端口号',
    dataIndex: 'interfaceNumber',
    key: 'interfaceNumber',
  },
  {
    title: '错误信息',
    dataIndex: 'info',
    key: 'info',
  },
  {
    title: '状态码',
    dataIndex: 'statusCode',
    key: 'statusCode',
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: '请求耗时',
    dataIndex: 'requestTime',
    key: 'requestTime',
  },
  {
    title: '请求参数',
    dataIndex: 'params',
    key: 'params',
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
    interfaceNumber: 403,
    info: 'Request failed with status code 500',
    statusCode: 500,
    time: '7/21/2021. 14:31:22',
    requestTime: '10ms',
    params: '{params:params}',
    eventNumber: 160,
    userNumber: 105,
  },
  {
    interfaceNumber: 403,
    info: 'Request failed with status code 500',
    statusCode: 500,
    time: '7/21/2021. 14:31:22',
    requestTime: '10ms',
    params: '{params:params}',
    eventNumber: 160,
    userNumber: 105,
  },
  {
    interfaceNumber: 403,
    info: 'Request failed with status code 500',
    statusCode: 500,
    time: '7/21/2021. 14:31:22',
    requestTime: '10ms',
    params: '{params:params}',
    eventNumber: 160,
    userNumber: 105,
  },
  {
    interfaceNumber: 403,
    info: 'Request failed with status code 500',
    statusCode: 500,
    time: '7/21/2021. 14:31:22',
    requestTime: '10ms',
    params: '{params:params}',
    eventNumber: 160,
    userNumber: 105,
  },
  {
    interfaceNumber: 403,
    info: 'Request failed with status code 500',
    statusCode: 500,
    time: '7/21/2021. 14:31:22',
    requestTime: '10ms',
    params: '{params:params}',
    eventNumber: 160,
    userNumber: 105,
  },
];
export const HttpError = () => {
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
