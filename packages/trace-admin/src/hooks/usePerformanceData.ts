import { useEffect, useState } from 'react';
import { getPerformanceMetrics } from '@/apis/request';
import { ApiRequest, PerformanceMetric, ResourceLoad, LongTask } from '../types';

export const usePerformanceData = params => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [resources, setResources] = useState<ResourceLoad[]>([]);
  const [LongTask, setLongTasks] = useState<LongTask[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPerformanceMetrics(params);
        const data = response.data;
        setMetrics(data.performanceMetrics);
        setRequests(data.apiRequests);
        setResources(data.resourceLoads);
        setLongTasks(data.LongTask);
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK') {
          console.error('Network error:', error.message);
        } else {
          console.error('Error fetching performance data:', error);
        }
      }
    };

    fetchData();
  }, [params]);

  return { metrics, requests, resources, LongTask };
};
