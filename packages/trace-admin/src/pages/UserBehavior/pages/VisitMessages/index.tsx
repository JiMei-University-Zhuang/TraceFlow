import React, { useState } from 'react';
import Search from '../../components/Search';
import MyList from '../../components/MyList';
import { VisitData } from '../../../../hooks/userData';

export default function VisitMessages() {
  const formFields = [
    { label: '用户ID', name: 'userID', type: 'input' as const },
    {
      label: 'http请求',
      name: 'httpRequest',
      type: 'select' as const,
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
      ],
    },
    { label: '访问来源', name: 'routeInfo', type: 'input' as const },
    {
      label: '访问时长',
      name: 'visitTime',
      type: 'select' as const,
      options: [
        { label: '<1分钟', value: '<1' },
        { label: '1~10分钟', value: '1-10' },
        { label: '10~60分钟', value: '10-60' },
        { label: '>60分钟', value: '>60' },
      ],
    },
    {
      label: '访问时间',
      name: 'VisitStamp',
      type: 'select' as const,
      options: [
        { label: '1天内', value: '<1' },
        { label: '7天内', value: '<7' },
        { label: '30天内', value: '<30' },
        { label: '180天内', value: '<180' },
        { label: '大于180天', value: '>180' },
      ],
    },
  ];

  // 表格的列定义

  const columns = [
    { title: '用户ID', dataIndex: 'userID', key: 'userId' },
    { title: '访问来源', dataIndex: 'routeInfo', key: 'routeInfo' },
    { title: 'http请求', dataIndex: 'httpRequest', key: 'httpRequest' },
    { title: '访问时长', dataIndex: 'visitTime', key: 'visitTime', render: (text: string) => formatTime(parseInt(text.replace('s', ''))) },
    { title: '访问时间', dataIndex: 'timestamp', key: 'timestamp' },
  ];

  // 用于存储筛选后的数据
  const [filteredData, setFilteredData] = useState<VisitData[]>(VisitData);
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h > 0 ? `${h}小时` : ''}${m > 0 ? `${m}分钟` : ''}${s > 0 ? `${s}秒` : ''}`;
  };
  // 筛选数据的函数
  const filterData = (values: any) => {
    let filtered = VisitData;
    // 用户ID过滤
    if (values.userID) {
      filtered = filtered.filter(user => user.userID.includes(values.userID));
    }
    if (values.routeInfo) {
      filtered = filtered.filter(user => user.routeInfo.includes(values.routeInfo));
    }
    // HTTP 请求筛选
    if (values.httpRequest) {
      filtered = filtered.filter(user => user.httpRequest === values.httpRequest);
    }
    if (values.visitTime) {
      const filterVisitTime = (visitTime: string, condition: string): boolean => {
        const visitSeconds = parseInt(visitTime.replace('s', ''));
        const visitMinutes = visitSeconds / 60;
        if (condition.startsWith('<')) {
          return visitMinutes < parseInt(condition.substring(1));
        }
        if (condition.startsWith('>')) {
          return visitMinutes > parseInt(condition.substring(1));
        }
        const [min, max] = condition.split('~').map(val => parseInt(val));
        return visitMinutes >= min && visitMinutes <= max;
      };

      filtered = filtered.filter(user => filterVisitTime(user.visitTime, values.visitTime));
    }
    // 根据访问时间进行筛选
    if (values.VisitStamp) {
      const currentDate = new Date();
      filtered = filtered.filter(user => {
        const visitDate = new Date(user.timestamp);
        const diffDays = (currentDate.getTime() - visitDate.getTime()) / (1000 * 3600 * 24);
        if (values.VisitStamp.startsWith('<')) return diffDays <= parseInt(values.VisitStamp.substring(1));
        if (values.VisitStamp.startsWith('>')) return diffDays > parseInt(values.VisitStamp.substring(1));
        return false;
      });
    }

    setFilteredData(filtered);
  };

  // 表单提交的处理
  const handleFormSubmit = (values: any) => {
    filterData(values); // 筛选数据
  };

  return (
    <div>
      {/* 渲染 Search 组件并传递表单字段和提交处理函数 */}
      <Search fields={formFields} onSubmit={handleFormSubmit} />
      {/* 渲染 MyList 组件并传递筛选后的数据 */}
      <MyList columns={columns} data={filteredData} />
    </div>
  );
}
