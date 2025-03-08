// hooks/usePerformanceData.ts
import { useEffect, useState } from 'react';
import { PerformanceMetric, ApiRequest, ResourceLoad } from '../types/index';

// 直接导入本地 JSON 数据
import rawData from '../data/db.json';
interface PerformanceData {
  metrics: PerformanceMetric[];
  requests: ApiRequest[];
  resources: ResourceLoad[];
}

const usePerformanceData = () => {
  const [data, setData] = useState<PerformanceData>({
    metrics: [],
    requests: [],
    resources: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟异步加载过程
    const timer = setTimeout(() => {
      try {
        // 转换数据结构
        const transformedData: PerformanceData = {
          metrics: rawData.performanceMetrics,
          requests: rawData.apiRequests,
          resources: rawData.resourceLoads,
        };

        setData(transformedData);
      } catch (error) {
        console.error('Error loading local data:', error);
      } finally {
        setLoading(false);
      }
    }, 800); // 模拟网络延迟

    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
};

export default usePerformanceData;
