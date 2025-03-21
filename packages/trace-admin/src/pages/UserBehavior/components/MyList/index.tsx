import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import './index.css';

// 定义数据类型
interface DataType {
  userID: string;
  userName: string;
  visitCount: number;
  visitTime: string;
  firstVisit: string;
  lastVisit: string;
}

// 定义组件 Props
interface MyListProps {
  columns: TableProps<DataType>['columns'];
  data: DataType[];
}

// MyList 组件
const MyList: React.FC<MyListProps> = ({ columns, data }) => (
  <Table<DataType>
    columns={columns}
    dataSource={data}
    className="custom-table"
    rowKey="userID"
    pagination={{
      pageSize: 10,
      className: 'custom-pagination',
    }}
    style={{ marginTop: '20px' }}
  />
);

export default MyList;
