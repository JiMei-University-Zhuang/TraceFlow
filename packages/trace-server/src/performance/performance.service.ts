import { Injectable } from '@nestjs/common';
import { PerformanceMetricDto } from './dto/performance-metric.dto';

@Injectable()
export class PerformanceService {
  private metrics: PerformanceMetricDto[] = [];

  // 保存性能指标数据
  async saveMetric(metric: PerformanceMetricDto) {
    this.metrics.push(metric);
    return metric;
  }

  // 获取指定名称的性能指标
  async getMetricsByName(metricName: string) {
    return this.metrics.filter((metric) => metric.metricName === metricName);
  }

  // 获取指定时间范围内的性能指标
  async getMetricsByTimeRange(
    startTime: number,
    endTime: number,
    limit?: number,
  ) {
    let result = this.metrics.filter(
      (metric) => metric.timestamp >= startTime && metric.timestamp <= endTime,
    );

    // 按时间戳降序排序
    result = result.sort((a, b) => b.timestamp - a.timestamp);

    // 如果有限制，则只返回指定数量
    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }
}
