import React from 'react';
import { Row, Col, Card, Tooltip } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { QuestionCircleOutlined, LineChartOutlined, ApiOutlined, FileOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { TimeSelector } from '@/components/selectHeader';
import createHeaderState from '@/store/createHeaderState';
import styles from './index.module.less';

const useTimeState = createHeaderState();

const PerformanceAnalysis: React.FC = () => {
  const { metrics = [], requests = [], resources = [], longTasks = [] } = usePerformanceData({ metricName: 'LCP' });
  const { timeState, onchangeTime } = useTimeState();

  // 基础图表配置（统一样式）
  const getBaseChartOption = () => ({
    animation: true,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    tooltip: {
      className: 'echarts-tooltip-diy',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e8e8e8',
      textStyle: {
        color: '#333',
      },
      extraCssText: 'box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);',
    },
  });

  // 核心性能指标图表
  const coreMetricsOption: EChartsOption = {
    ...getBaseChartOption(),
    color: ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1'],
    title: {
      text: '核心性能指标趋势',
      left: 'center',
      textStyle: { color: '#333', fontWeight: 500, fontSize: 16 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#505765',
        },
      },
    },
    legend: {
      data: ['LCP', 'FP', 'FCP', 'CLS', '首屏时间'],
      top: 30,
      textStyle: { fontSize: 12 },
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
      axisTick: {
        show: true,
      },
      axisLabel: {
        formatter: (value: number) => new Date(value).toLocaleTimeString(),
        color: '#666',
        fontSize: 11,
      },
    },
    yAxis: [
      {
        name: '时间(s)',
        nameTextStyle: {
          fontSize: 12,
          color: '#666',
        },
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee',
          },
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          formatter: (value: number) => `${value}s`,
          color: '#666',
          fontSize: 11,
        },
      },
      {
        name: 'CLS',
        nameTextStyle: {
          fontSize: 12,
          color: '#666',
        },
        type: 'value',
        splitLine: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          formatter: (value: number) => value.toFixed(4),
          color: '#666',
          fontSize: 11,
        },
      },
    ],
    series: [
      {
        name: 'LCP',
        type: 'line',
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        data: metrics.map(m => [m.timestamp, m.LCP]),
      },
      {
        name: 'FP',
        type: 'line',
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        data: metrics.map(m => [m.timestamp, m.FP]),
      },
      {
        name: 'FCP',
        type: 'line',
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        data: metrics.map(m => [m.timestamp, m.FCP]),
      },
      {
        name: 'CLS',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        data: metrics.map(m => [m.timestamp, m.CLS]),
      },
      {
        name: '首屏时间',
        type: 'line',
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        data: metrics.map(m => [m.timestamp, m.firstScreenTime]),
      },
    ],
  };

  // 接口请求分析
  const requestAnalysisOption: EChartsOption = {
    ...getBaseChartOption(),
    title: {
      text: '接口请求分析',
      left: 'center',
      textStyle: { color: '#333', fontWeight: 500, fontSize: 16 },
    },
    color: ['#1890ff', '#722ed1'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: requests.map(r => new Date(r.timestamp).toLocaleTimeString()),
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
      axisLabel: {
        rotate: 45,
        color: '#666',
        fontSize: 11,
        interval: 0,
      },
    },
    yAxis: [
      {
        name: '耗时(ms)',
        nameTextStyle: {
          fontSize: 12,
          color: '#666',
        },
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee',
          },
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: '#666',
          fontSize: 11,
        },
      },
      {
        name: '状态码',
        nameTextStyle: {
          fontSize: 12,
          color: '#666',
        },
        type: 'value',
        min: 200,
        max: 500,
        splitLine: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: '#666',
          fontSize: 11,
        },
      },
    ],
    series: [
      {
        name: '耗时',
        type: 'bar',
        data: requests.map(r => r.duration),
        barWidth: '40%',
        itemStyle: {
          color: '#1890ff',
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: '状态码',
        type: 'scatter',
        yAxisIndex: 1,
        data: requests.map(r => r.status),
        symbolSize: (value: number) => (value >= 400 ? 10 : 6),
        itemStyle: {
          color: params => {
            const value = params.value as number;
            if (typeof value === 'number') {
              return value >= 400 ? '#ff4d4f' : '#52c41a';
            }
            return '#52c41a';
          },
        },
      },
    ],
  };

  // 资源加载分析
  const resourceAnalysisOption: EChartsOption = {
    ...getBaseChartOption(),
    title: {
      text: '资源加载分析',
      left: 'center',
      textStyle: { color: '#333', fontWeight: 500, fontSize: 16 },
    },
    color: ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}ms ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12,
      },
      data: resources.map(r => r.type),
    },
    series: [
      {
        name: '加载耗时',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['60%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        labelLine: {
          length: 15,
          length2: 8,
        },
        data: resources.map(r => ({
          name: r.type,
          value: r.duration,
        })),
      },
    ],
  };

  // 长任务
  const longTaskOption: EChartsOption = {
    ...getBaseChartOption(),
    title: {
      text: '长任务监控（>50ms）',
      left: 'center',
      textStyle: { color: '#333', fontWeight: 500, fontSize: 16 },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const task = params.data;
        if (!task || !task.value) return '无数据';

        return `
          开始时间：${new Date(task.value[0]).toLocaleTimeString()}<br/>
          持续时间：${task.value[1]}ms<br/>
          任务类型：${task.name || '未知'}
        `;
      },
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
      axisLabel: {
        formatter: (value: number) => new Date(value).toLocaleTimeString(),
        color: '#666',
        fontSize: 11,
      },
    },
    yAxis: {
      name: '持续时间(ms)',
      nameTextStyle: {
        fontSize: 12,
        color: '#666',
      },
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee',
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        formatter: (value: number) => `${value}ms`,
        color: '#666',
        fontSize: 11,
      },
    },
    series: [
      {
        name: '长任务',
        type: 'scatter',
        symbolSize: data => Math.min(data[1] / 5, 30), // 根据持续时间调整大小
        data: longTasks?.map(task => ({
          value: [task.startTime, task.duration],
          name: task.name,
        })),
        itemStyle: {
          color: params => {
            const data = params.data as { value: [number, number]; name?: string } | undefined;
            if (!data || !data.value) return '#52c41a'; // 默认颜色

            const duration = data.value[1];
            return duration > 200 ? '#ff4d4f' : duration > 100 ? '#faad14' : '#52c41a';
          },
        },
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        start: 0,
        end: 100,
        xAxisIndex: 0,
        height: 20,
        bottom: 10,
        borderColor: '#ddd',
        fillerColor: 'rgba(24, 144, 255, 0.1)',
        handleStyle: {
          color: '#1890ff',
          borderColor: '#1890ff',
        },
      },
    ],
  };

  const renderTitle = () => (
    <div className={styles.title}>
      性能分析
      <span className={styles.subtitle}>
        监控应用性能指标，优化用户体验
        <Tooltip title="监控网页核心性能指标、API请求、资源加载和长任务，帮助您优化应用性能。">
          <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
        </Tooltip>
      </span>
    </div>
  );

  const renderHeader = () => (
    <div className={styles.header}>
      <TimeSelector time={timeState} onChangeTime={onchangeTime} />
    </div>
  );

  return (
    <div className={styles.container}>
      {renderHeader()}
      <div className={styles.content}>
        {renderTitle()}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card
              className={styles.card}
              title={
                <>
                  <LineChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  核心性能指标
                </>
              }
              bordered={false}
            >
              <div className={styles.chartContainer}>
                <ReactECharts option={coreMetricsOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              className={styles.card}
              title={
                <>
                  <ApiOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  接口请求分析
                </>
              }
              bordered={false}
            >
              <div className={styles.chartContainer}>
                <ReactECharts option={requestAnalysisOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              className={styles.card}
              title={
                <>
                  <FileOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  资源类型分布
                </>
              }
              bordered={false}
            >
              <div className={styles.chartContainer}>
                <ReactECharts option={resourceAnalysisOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              className={styles.card}
              title={
                <>
                  <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  长任务监控
                </>
              }
              bordered={false}
            >
              <div className={styles.chartContainer}>
                <ReactECharts option={longTaskOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PerformanceAnalysis;
