import React, { useEffect, useState } from 'react';
import { Table, ConfigProvider } from 'antd';
import type { TableProps } from 'antd';
import { getError } from '@/api/request';

interface ErrorType {
  _id: string;
  appId: string;
  errorUid: string;
  message: string;
  stack?: string;
  type: string;
  severity: string;
  category: string;
  timestamp: number;
  url: string;
  userAgent?: string;
  context: {
    userId: string;
    environment: string;
  };
}
const columns: TableProps<ErrorType>['columns'] = [
  {
    title: '错误文件',
    dataIndex: 'stack',
    key: 'stack',
  },
  {
    title: '错误信息',
    dataIndex: 'message',
    key: 'message',
  },
  {
    title: '错误类型',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
  },
  {
    title: '时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (timestamp: number) => new Date(timestamp).toLocaleString(), // 转换时间戳
  },
  {
    title: '用户ID',
    dataIndex: ['context', 'userId'],
    key: 'context.userId',
  },
];

export const PromiseError = () => {
  const [errorData, setErrorData] = useState<ErrorType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getError({ type: 'http' });
        console.log('响应数据:', response); // 打印响应数据

        if (response.data.data?.items) {
          const formattedData = response.data.data.items.map((item: ErrorType) => ({
            ...item,
            key: item._id,
          }));
          console.log('格式化后的数据:', formattedData); // 打印格式化后的数据
          setErrorData(formattedData);
        }
      } catch (error) {
        console.error('数据获取失败:', error);
      }
    };

    fetchData();
  }, []);
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
      <Table<ErrorType> columns={columns} dataSource={errorData} />
    </ConfigProvider>
  );
};
