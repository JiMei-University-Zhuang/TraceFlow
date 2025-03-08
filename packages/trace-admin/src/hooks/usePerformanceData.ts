// src/pages/PerformanceDashboard/hooks/usePerformanceData.ts
import { useEffect, useState } from 'react';
import rawData from '../data/db.json';
import { ApiRequest, PerformanceMetric, ResourceLoad } from '../types';

export const usePerformanceData = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [resources, setResources] = useState<ResourceLoad[]>([]);

  useEffect(() => {
    setMetrics(rawData.performanceMetrics);
    setRequests(rawData.apiRequests);
    setResources(rawData.resourceLoads);
  }, []);

  return { metrics, requests, resources };
};
