import React, { useState } from 'react';
import Search from '../../components/Search';
import MyList from '../../components/MyList';
import { UserData } from '../../../../hooks/userData';

export default function UserMessages() {
  const formFields = [
    { label: '用户ID', name: 'userID', type: 'input' as const },
    { label: '用户名', name: 'userName', type: 'input' as const },
    {
      label: '访问次数',
      name: 'visitCount',
      type: 'select' as const,
      options: [
        { label: '<10次', value: '0-10' },
        { label: '10~50次', value: '10-50' },
        { label: '50~200次', value: '50-200' },
        { label: '200次以上', value: '>200' },
      ],
    },
    {
      label: '访问时长',
      name: 'visitTime',
      type: 'select' as const,
      options: [
        { label: '<1分钟', value: '<1' },
        { label: '1~60分钟', value: '1-60' },
        { label: '1~24小时', value: '60-1440' },
        { label: '>24小时', value: '>1440' },
      ],
    },
    {
      label: '初次访问',
      name: 'firstVisit',
      type: 'select' as const,
      options: [
        { label: '1天内', value: '<1' },
        { label: '7天内', value: '<7' },
        { label: '30天内', value: '<30' },
        { label: '180天内', value: '<180' },
        { label: '大于180天', value: '>180' },
      ],
    },
    {
      label: '最后访问',
      name: 'lastVisit',
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
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h > 0 ? `${h}小时` : ''}${m > 0 ? `${m}分钟` : ''}${s > 0 ? `${s}秒` : ''}`;
  };
  // 表格的列定义
  const columns = [
    { title: '用户ID', dataIndex: 'userID', key: 'userId' },
    { title: '用户名', dataIndex: 'userName', key: 'userName' },
    { title: '访问次数', dataIndex: 'visitCount', key: 'visitCount' },
    {
      title: '访问时长',
      dataIndex: 'visitTime',
      key: 'visitTime',
      render: (text: string) => formatTime(parseInt(text.replace('s', ''))),
    },
    { title: '初次访问', dataIndex: 'firstVisit', key: 'firstVisit' },
    { title: '最后访问', dataIndex: 'lastVisit', key: 'lastVisit' },
  ];

  // 用于存储筛选后的数据
  const [filteredData, setFilteredData] = useState<UserData[]>(UserData);

  // 筛选数据的函数
  const filterData = (values: any) => {
    let filtered = UserData;

    // 根据访问次数进行筛选
    if (values.visitCount) {
      const countRange = values.visitCount;
      let min = 0;
      let max = Number.MAX_VALUE;

      if (countRange.includes('-')) {
        [min, max] = countRange.split('-').map((item: string) => parseInt(item));
      } else if (countRange.startsWith('>')) {
        min = parseInt(countRange.substring(1)); // 取大于号后的值
      }

      filtered = filtered.filter(user => user.visitCount >= min && user.visitCount <= max);
    }

    // 根据访问时长进行筛选
    if (values.visitTime) {
      const [min, max] = values.visitTime.split('~').map((item: string) => item.replace('<', ''));

      filtered = filtered.filter(user => {
        // 从数据中提取访问时长（以秒为单位）并转换为分钟
        const visitTimeMinutes = parseInt(user.visitTime.replace('s', '')) / 60;

        // 处理小于和大于的特殊情况
        if (values.visitTime.startsWith('<')) {
          return visitTimeMinutes < parseInt(min);
        }
        if (values.visitTime.startsWith('>')) {
          return visitTimeMinutes > parseInt(min);
        }

        // 正常区间比较
        return visitTimeMinutes >= parseInt(min) && visitTimeMinutes <= (max ? parseInt(max) : Number.MAX_VALUE);
      });
    }

    // 根据用户ID筛选
    if (values.userID) {
      filtered = filtered.filter(user => user.userID.includes(values.userID));
    }

    // 根据用户名筛选
    if (values.userName) {
      filtered = filtered.filter(user => user.userName.includes(values.userName));
    }

    // 根据初次访问筛选
    const filterByDays = (dateString: string, dayRange: string) => {
      const currentDate = new Date();
      const visitDate = new Date(dateString);
      const diffDays = (currentDate.getTime() - visitDate.getTime()) / (1000 * 3600 * 24); // 计算天数差

      if (dayRange.startsWith('<')) {
        const maxDays = parseInt(dayRange.substring(1));
        return diffDays <= maxDays;
      } else if (dayRange.startsWith('>')) {
        const minDays = parseInt(dayRange.substring(1));
        return diffDays > minDays;
      }
      return false;
    };

    // 6. 根据初次访问筛选
    if (values.firstVisit) {
      filtered = filtered.filter(user => filterByDays(user.firstVisit, values.firstVisit));
    }

    // 7. 根据最后访问筛选
    if (values.lastVisit) {
      filtered = filtered.filter(user => filterByDays(user.lastVisit, values.lastVisit));
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
