import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tag, Progress } from 'antd';
import { AlertOutlined, CheckCircleOutlined, LineChartOutlined, UserOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

// 导入模块化样式
import styles from './index.module.less';

// 导入模拟数据
import { recentErrorsData, performanceData, statusColors, statisticsData } from '@/mock/dashboardMock';

const Dashboard: React.FC = () => {
  // 错误列表的表格列
  const errorColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '页面',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
    },
    {
      title: '严重程度',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let icon = <ExclamationCircleOutlined />;
        if (status === 'critical') {
          icon = <CloseCircleOutlined />;
        }

        return (
          <Tag color={statusColors[status as keyof typeof statusColors]} icon={icon}>
            {status === 'critical' ? '严重' : status === 'high' ? '高' : status === 'medium' ? '中' : '低'}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>系统概览</h1>

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="今日错误总数" value={statisticsData.errorCount} valueStyle={{ color: '#ff4d4f' }} prefix={<AlertOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="API请求成功率" value={statisticsData.successRate} precision={1} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="页面平均加载时间" value={statisticsData.avgLoadTime} precision={1} valueStyle={{ color: '#1890ff' }} prefix={<LineChartOutlined />} suffix="s" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="今日活跃用户" value={statisticsData.activeUsers} valueStyle={{ color: '#722ed1' }} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      <div className={styles.contentSection}>
        <div className={styles.sectionTitle}>最近错误</div>
        <Card className={styles.errorList}>
          <Table dataSource={recentErrorsData} columns={errorColumns} pagination={false} size="middle" />
        </Card>

        <div className={styles.sectionTitle}>性能趋势</div>
        <Card className={styles.performanceChart}>
          <Typography.Title level={5}>页面加载时间趋势 (秒)</Typography.Title>
          <div className={styles.chartContainer}>
            {performanceData.map((item, index) => (
              <div key={index} className={styles.chartItem}>
                <div className={styles.chartDay}>{item.day}</div>
                <div className={styles.chartBar}>
                  <div className={styles.barItem}>
                    <div className={styles.barLabel}>API响应: {item.apiResponseTime}s</div>
                    <Progress percent={item.apiResponseTime * 50} status="active" showInfo={false} strokeColor="#1890ff" />
                  </div>
                  <div className={styles.barItem}>
                    <div className={styles.barLabel}>渲染时间: {item.renderTime}s</div>
                    <Progress percent={item.renderTime * 50} status="active" showInfo={false} strokeColor="#52c41a" />
                  </div>
                  <div className={styles.barItem}>
                    <div className={styles.barLabel}>总加载时间: {item.loadTime}s</div>
                    <Progress percent={item.loadTime * 33} status="active" showInfo={false} strokeColor="#722ed1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
