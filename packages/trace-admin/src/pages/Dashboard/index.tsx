import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tag, Progress } from 'antd';
import { AlertOutlined, CheckCircleOutlined, LineChartOutlined, UserOutlined, ExclamationCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

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
      width: 100,
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
      width: 120,
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 100,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 140,
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
      width: 100,
      align: 'center' as const,
    },
  ];

  // 页面标题
  const pageTitle = () => (
    <div className={styles.title}>
      系统概览
      <span style={{ fontSize: 14, fontWeight: 'normal', color: 'rgba(0,0,0,0.45)', marginLeft: 12 }}>实时监控应用性能和错误情况</span>
    </div>
  );

  // 渲染性能趋势图表项
  const renderPerformanceItem = (item: (typeof performanceData)[0], index: number) => {
    const maxValue = 3; // 假设最大值是3秒
    const apiWidth = (item.apiResponseTime / maxValue) * 100;
    const renderWidth = (item.renderTime / maxValue) * 100;
    const totalWidth = (item.loadTime / maxValue) * 100;

    return (
      <div key={index} className={styles.chartItem}>
        <div className={styles.chartDay}>{item.day}</div>
        <div className={styles.chartBar}>
          <div className={styles.barItem}>
            <div className={styles.barLabel} data-value={`${item.apiResponseTime}s`}>
              API响应时间
            </div>
            <Progress percent={apiWidth} status="active" showInfo={false} strokeColor="#1890ff" trailColor="rgba(0,0,0,0.04)" />
          </div>
          <div className={styles.barItem}>
            <div className={styles.barLabel} data-value={`${item.renderTime}s`}>
              渲染时间
            </div>
            <Progress percent={renderWidth} status="active" showInfo={false} strokeColor="#52c41a" trailColor="rgba(0,0,0,0.04)" />
          </div>
          <div className={styles.barItem}>
            <div className={styles.barLabel} data-value={`${item.loadTime}s`}>
              总加载时间
            </div>
            <Progress percent={totalWidth} status="active" showInfo={false} strokeColor="#722ed1" trailColor="rgba(0,0,0,0.04)" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {pageTitle()}

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="今日错误总数" value={statisticsData.errorCount} valueStyle={{ color: '#ff4d4f', fontSize: '28px' }} prefix={<AlertOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic
              title="API请求成功率"
              value={statisticsData.successRate}
              precision={1}
              valueStyle={{ color: '#52c41a', fontSize: '28px' }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic
              title="页面平均加载时间"
              value={statisticsData.avgLoadTime}
              precision={1}
              valueStyle={{ color: '#1890ff', fontSize: '28px' }}
              prefix={<LineChartOutlined />}
              suffix="s"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="今日活跃用户" value={statisticsData.activeUsers} valueStyle={{ color: '#722ed1', fontSize: '28px' }} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      <div className={styles.contentSection}>
        <div className={styles.sectionTitle}>
          <ClockCircleOutlined style={{ marginRight: 8, fontSize: 16, color: '#1890ff' }} />
          最近错误
        </div>
        <Card className={styles.errorList} bordered={false}>
          <Table dataSource={recentErrorsData} columns={errorColumns} pagination={false} size="middle" rowKey="key" scroll={{ x: '100%' }} />
        </Card>

        <div className={styles.sectionTitle}>
          <LineChartOutlined style={{ marginRight: 8, fontSize: 16, color: '#1890ff' }} />
          性能趋势
        </div>
        <Card className={styles.performanceChart} bordered={false}>
          <Typography.Title level={5}>页面加载时间趋势 (秒)</Typography.Title>
          <div className={styles.chartContainer}>{performanceData.map(renderPerformanceItem)}</div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
