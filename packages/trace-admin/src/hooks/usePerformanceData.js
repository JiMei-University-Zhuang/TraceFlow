// hooks/usePerformanceData.ts
import { useEffect, useState } from 'react';
// 直接导入本地 JSON 数据（根据实际路径调整）
import rawData from '../data/db.json'; // 路径可能需要调整
const usePerformanceData = () => {
  const [data, setData] = useState({
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
        const transformedData = {
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
