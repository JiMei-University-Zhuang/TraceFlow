// src/pages/PerformanceDashboard/hooks/usePerformanceData.ts
import { useEffect, useState } from 'react';
import rawData from '../data/db.json';
import { ApiRequest, PerformanceMetric, ResourceLoad, LongTask } from '../types';

export const usePerformanceData = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [resources, setResources] = useState<ResourceLoad[]>([]);
  const [LongTask, setLongTask] = useState<LongTask[]>([]);

  useEffect(() => {
    setMetrics(rawData.performanceMetrics);
    setRequests(rawData.apiRequests);
    setResources(rawData.resourceLoads);
    setLongTask(rawData.LongTask);
  }, []);

  return { metrics, requests, resources, LongTask };
};
