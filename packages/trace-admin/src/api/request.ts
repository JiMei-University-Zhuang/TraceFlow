import { http } from '@/utils/request';

interface GetPerformanceMetricsParams {
  metricName: string;
}

interface getErrorParams {
  type?: string;
  startTime?: string;
  page?: string;
  pageSize?: string;
}

//获取性能指标列表
export function getPerformanceMetrics(params: GetPerformanceMetricsParams) {
  return http({
    url: '/performance/metrics',
    method: 'get',
    params,
  });
}

//查询错误报告列表
export function getError(params: getErrorParams) {
  return http({
    url: '/error-monitoring/query',
    method: 'get',
    params,
  });
}
