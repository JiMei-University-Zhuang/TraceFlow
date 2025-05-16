import { useEffect, useState } from 'react';
import { getPerformanceMetrics } from '@/apis/request';
import { ApiRequest, PerformanceMetric, ResourceLoad, LongTask } from '../types';

export const usePerformanceData = params => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [resources, setResources] = useState<ResourceLoad[]>([]);
  const [longTasks, setLongTasks] = useState<LongTask[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPerformanceMetrics({ metricName: 'LCP' });
        // console.log('Fetched performance data:', response); // 打印获取的数据

        if (response && response.data.data.metrics) {
          const data = response.data.data.metrics;

          setMetrics(data.metricName || []);
          setRequests(data.metricName || []);
          setResources(data.metricName || []);
          setLongTasks(data.metricName || []);
        }
      } catch (error: any) {
        console.error('Error fetching performance data:', error);
      }
    };

    fetchData();
  }, [params]);

  return { metrics, requests, resources, longTasks };
};
