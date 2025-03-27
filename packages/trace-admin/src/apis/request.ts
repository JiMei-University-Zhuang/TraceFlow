import { http } from '@/utils/request';

interface GetPerformanceMetricsParams {
  range?: string;
  startTime?: number;
  endTime?: number;
  limit?: string;
}

//获取性能指标列表
export function getPerformanceMetrics(params: GetPerformanceMetricsParams) {
  return http({
    url: '/performance/metrics/timerange',
    method: 'get',
    params,
  });
}
