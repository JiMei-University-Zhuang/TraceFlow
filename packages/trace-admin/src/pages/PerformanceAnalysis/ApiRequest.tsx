import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { ApiRequest } from '../../types';

// 定义每小时数据聚合后的类型
interface HourlyDataItem {
  count: number;
  totalDuration: number;
  success: number;
  errors: number;
  methodCounts: Record<string, number>;
}

interface Props {
  requests: ApiRequest[];
}

const ApiRequest: React.FC<Props> = ({ requests }) => {
  // 数据处理：按时间排序并转换格式
  const processedData = requests
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(req => ({
      date: new Date(req.timestamp),
      duration: req.duration,
      status: req.status,
      method: req.method,
    }));

  // 按时间聚合数据（每小时）
  const hourlyData: Record<string, HourlyDataItem> = processedData.reduce(
    (acc, curr) => {
      const hourKey = `${curr.date.getHours()}:00`;
      if (!acc[hourKey]) {
        acc[hourKey] = {
          count: 0,
          totalDuration: 0,
          success: 0,
          errors: 0,
          methodCounts: {},
        };
      }
      acc[hourKey].count++;
      acc[hourKey].totalDuration += curr.duration;
      if (curr.status >= 200 && curr.status < 400) {
        acc[hourKey].success++;
      } else {
        acc[hourKey].errors++;
      }
      // 统计每种请求方法的数量
      acc[hourKey].methodCounts[curr.method] = (acc[hourKey].methodCounts[curr.method] || 0) + 1;
      return acc;
    },
    {} as Record<string, HourlyDataItem>,
  );

  // 生成图表配置
  const getOption = (): echarts.EChartsOption => ({
    title: {
      text: '接口请求分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0].data;
        const methodCounts = hourlyData[data[0]].methodCounts;
        let methodInfo = '';
        Object.entries(methodCounts).forEach(([method, count]) => {
          methodInfo += `${method}: ${count} 次<br/>`;
        });
        return `
                  时间: ${data[0]}<br/>
                  平均耗时: ${data[1].toFixed(2)}ms<br/>
                  请求次数: ${data[2]}<br/>
                  成功率: ${((data[3] / data[2]) * 100).toFixed(1)}%<br/>
                  请求方法分布:<br/>
                  ${methodInfo}
                `;
      },
    },
    legend: {
      data: ['平均耗时', '请求次数'],
      top: 30,
    },
    xAxis: {
      type: 'category',
      data: Object.keys(hourlyData),
    },
    yAxis: [
      {
        type: 'value',
        name: '耗时 (ms)',
        min: 0,
        alignTicks: false, // 避免刻度不可读警告
      },
      {
        type: 'value',
        name: '请求次数',
        min: 0,
        alignTicks: false,
      },
    ],
    series: [
      {
        name: '平均耗时',
        type: 'line',
        smooth: true,
        // 显式指定 data 为 [string, number] 类型的数组
        data: Object.entries(hourlyData).map(([hour, data]: [string, HourlyDataItem]) => [hour, data.totalDuration / data.count]),
        itemStyle: {
          color: '#1890ff',
        },
      },
      {
        name: '请求次数',
        type: 'bar',
        yAxisIndex: 1,
        // 显式指定 data 为 [string, number] 类型的数组
        data: Object.entries(hourlyData).map(([hour, data]: [string, HourlyDataItem]) => [hour, data.count]),
        itemStyle: {
          color: '#91d5ff',
        },
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
      },
    ],
  });

  return (
    <div style={{ padding: 24 }}>
      <ReactECharts option={getOption()} style={{ height: 600 }} opts={{ renderer: 'svg' }} />

      {/* 端点分布饼图 */}
      <div style={{ marginTop: 40 }}>
        <h3>请求端点分布</h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'item',
            },
            series: [
              {
                type: 'pie',
                radius: '55%',
                data: Object.entries(
                  requests.reduce(
                    (acc, curr) => {
                      acc[curr.url] = (acc[curr.url] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([name, value]) => ({ name, value })),
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                  },
                },
              },
            ],
          }}
          style={{ height: 400 }}
        />
      </div>
    </div>
  );
};

export default ApiRequest;
