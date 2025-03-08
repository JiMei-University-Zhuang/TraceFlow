//import React from 'react';
import { Row, Col, Card } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { usePerformanceData } from '../../hooks/usePerformanceData';

const PerformanceDashboard = () => {
  const { metrics, requests, resources } = usePerformanceData();

  // 核心性能指标图表
  const coreMetricsOption: EChartsOption = {
    title: { text: '核心性能指标趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['LCP', 'FP', 'FCP', 'CLS', '首屏时间'], top: 30 },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (value: number) => new Date(value).toLocaleTimeString(),
      },
    },
    yAxis: [
      {
        name: '时间(s)',
        type: 'value',
        axisLabel: {
          formatter: (value: number) => `${value}s`,
        },
      },
      {
        name: 'CLS',
        type: 'value',
        axisLabel: {
          formatter: (value: number) => value.toFixed(4),
        },
      },
    ],
    series: [
      {
        name: 'LCP',
        type: 'line',
        data: metrics.map(m => [m.timestamp, m.LCP]),
      },
      {
        name: 'FP',
        type: 'line',
        data: metrics.map(m => [m.timestamp, m.FP]),
      },
      {
        name: 'FCP',
        type: 'line',
        data: metrics.map(m => [m.timestamp, m.FCP]),
      },
      {
        name: 'CLS',
        type: 'line',
        yAxisIndex: 1,
        data: metrics.map(m => [m.timestamp, m.CLS]),
      },
      {
        name: '首屏时间',
        type: 'line',
        data: metrics.map(m => [m.timestamp, m.firstScreenTime]),
      },
    ],
  };

  // 接口请求分析
  const requestAnalysisOption: EChartsOption = {
    title: { text: '接口请求分析', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: requests.map(r => new Date(r.timestamp).toLocaleTimeString()),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        name: '耗时(ms)',
        type: 'value',
      },
      {
        name: '状态码',
        type: 'value',
        min: 200,
        max: 500,
      },
    ],
    series: [
      {
        name: '耗时',
        type: 'bar',
        data: requests.map(r => r.duration),
        itemStyle: {
          color: '#1890ff',
        },
      },
      {
        name: '状态码',
        type: 'scatter',
        yAxisIndex: 1,
        data: requests.map(r => r.status),
        symbolSize: (value: number) => (value >= 400 ? 10 : 6),
        // itemStyle: {
        //   color: (params) => params.value > 400 ? '#ff4d4f' : '#52c41a'
        // }
      },
    ],
  };

  // 资源加载分析
  const resourceAnalysisOption: EChartsOption = {
    title: {
      text: '资源加载分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}ms ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: resources.map(r => r.type),
    },
    series: [
      {
        name: '加载耗时',
        type: 'pie',
        radius: '55%',
        data: resources.map(r => ({
          name: r.type,
          value: r.duration,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="核心性能指标">
            <ReactECharts option={coreMetricsOption} style={{ height: 300 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="接口请求分析">
            <ReactECharts option={requestAnalysisOption} style={{ height: 200 }} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="资源类型分布">
            <ReactECharts option={resourceAnalysisOption} style={{ height: 200 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceDashboard;
