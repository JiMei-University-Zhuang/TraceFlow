import { jsx as _jsx } from 'react/jsx-runtime';
import ReactECharts from 'echarts-for-react';
const PerformanceAnalysis = ({ metrics }) => {
  // 雷达图指标定义
  const indicators = [
    { name: 'LCP', max: 4 },
    { name: 'FP', max: 2 },
    { name: 'FCP', max: 3 },
    { name: 'CLS', max: 0.3 },
    { name: '首屏时间', max: 5 },
  ];
  // 转换数据格式
  const formatData = metrics.map(metric => ({
    value: [metric.LCP, metric.FP, metric.FCP, metric.CLS, metric.firstScreenTime],
    name: new Date(metric.timestamp).toLocaleDateString(),
  }));
  const getOption = () => ({
    title: {
      text: '性能指标雷达图',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      data: metrics.map(m => new Date(m.timestamp).toLocaleDateString()),
      bottom: 0,
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: 'rgb(171, 212, 232)',
      },
      splitArea: {
        areaStyle: {
          color: ['#f0f8ff', '#e6f7ff', '#ddf3ff', '#d4eaff'],
          shadowColor: 'rgba(0, 100, 100, 0.3)',
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: formatData,
        areaStyle: {
          opacity: 0.2,
        },
        lineStyle: {
          width: 2,
        },
        label: {
          show: true,
        },
        emphasis: {
          lineStyle: {
            width: 3,
          },
          areaStyle: {
            opacity: 0.4,
          },
        },
      },
    ],
  });
  return _jsx(ReactECharts, { option: getOption(), style: { height: 300, margin: '300px 50px' }, opts: { renderer: 'svg' } });
};
export default PerformanceAnalysis;
