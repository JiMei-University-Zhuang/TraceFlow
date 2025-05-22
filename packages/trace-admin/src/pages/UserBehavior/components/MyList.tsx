import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';

// 定义组件 Props，使用泛型 T 代替固定数据类型
interface MyListProps<T> {
  columns: TableProps<T>['columns'];
  data: T[];
  loading?: boolean;
  pagination?: TableProps<T>['pagination'];
}

// MyList 组件，使用泛型 T
const MyList = <T extends object>({ columns, data, loading = false, pagination = { pageSize: 10 } }: MyListProps<T>): React.ReactElement => (
  <Table<T>
    columns={columns}
    dataSource={data}
    loading={loading}
    rowKey={record => {
      const key = 'id' in record ? 'id' : Object.keys(record)[0];
      return String((record as any)[key]);
    }}
    pagination={pagination}
    style={{ marginTop: '20px' }}
    size="middle"
  />
);

export default MyList;
