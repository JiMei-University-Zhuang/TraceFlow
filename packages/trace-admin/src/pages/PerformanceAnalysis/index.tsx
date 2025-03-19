//import React from 'react';
import { Row, Col, Card } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { usePerformanceData } from '../../hooks/usePerformanceData';
import { LongTask } from '@/types';
import { TimeSelector } from '@/components/selectHeader';
import createHeaderState from '@/store/createHeaderState';
const useTimeState = createHeaderState();

const PerformanceDashboard = () => {
  const { metrics, requests, resources, LongTask } = usePerformanceData();
  const { timeState, onchangeTime } = useTimeState();

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

  // 长任务
  const longTaskOption: EChartsOption = {
    title: { text: '长任务监控（>50ms）', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const task = params[0].data as LongTask;
        return `
          开始时间：${new Date(task.startTime).toLocaleTimeString()}<br/>
          持续时间：${task.duration}ms<br/>
          任务类型：${task.name || '未知'}
        `;
      },
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (value: number) => new Date(value).toLocaleTimeString(),
      },
    },
    yAxis: {
      name: '持续时间(ms)',
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `${value}ms`,
      },
    },
    series: [
      {
        name: '长任务',
        type: 'scatter',
        symbolSize: data => Math.min(data[1] / 5, 30), // 根据持续时间调整大小
        data: LongTask.map(task => ({
          value: [task.startTime, task.duration],
          name: task.name,
        })),
        itemStyle: {
          color: params => {
            const duration = (params.data as any).value[1];
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
      },
    ],
  };

  return (
    <div style={{ padding: 24, marginTop: 80 }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          height: 96,
          zIndex: 1,
          background: '#333',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 0px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TimeSelector time={timeState} onChangeTime={onchangeTime}></TimeSelector>{' '}
      </div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="核心性能指标">
            <ReactECharts option={coreMetricsOption} style={{ height: 250 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="接口请求分析">
            <ReactECharts option={requestAnalysisOption} style={{ height: 250 }} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="资源类型分布">
            <ReactECharts option={resourceAnalysisOption} style={{ height: 250 }} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="长任务监控">
            <ReactECharts option={longTaskOption} style={{ height: 250 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceDashboard;
