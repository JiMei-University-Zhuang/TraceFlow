import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { AlertOutlined, CheckCircleOutlined, LineChartOutlined, UserOutlined } from '@ant-design/icons';

// 导入模块化样式
import styles from './index.less';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>系统概览</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="今日错误总数" value={128} valueStyle={{ color: '#ff4d4f' }} prefix={<AlertOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="API请求成功率" value={99.8} precision={1} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="页面平均加载时间" value={1.5} precision={1} valueStyle={{ color: '#1890ff' }} prefix={<LineChartOutlined />} suffix="s" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.card}>
            <Statistic title="今日活跃用户" value={1834} valueStyle={{ color: '#722ed1' }} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      <div className={styles.sectionTitle}>最近错误</div>
      <Card className={styles.errorList}>
        <div className={styles.placeholder}>这里将显示最近错误列表，使用懒加载技术...</div>
      </Card>

      <div className={styles.sectionTitle}>性能趋势</div>
      <Card className={styles.performanceChart}>
        <div className={styles.placeholder}>这里将显示性能趋势图表，使用懒加载技术...</div>
      </Card>
    </div>
  );
};

export default Dashboard;
