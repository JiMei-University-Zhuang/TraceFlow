import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import './index.css';

// 定义组件 Props，使用泛型 T 代替固定数据类型
interface MyListProps<T> {
  columns: TableProps<T>['columns'];
  data: T[];
}

// MyList 组件，使用泛型 T
const MyList = <T extends object>({ columns, data }: MyListProps<T>): React.ReactElement => (
  <Table<T>
    columns={columns}
    dataSource={data}
    className="custom-table"
    rowKey={record => Object.keys(record)[0] as string} // 使用第一列的键作为 rowKey
    pagination={{
      pageSize: 10,
      className: 'custom-pagination',
    }}
    style={{ marginTop: '20px' }}
  />
);

export default MyList;
