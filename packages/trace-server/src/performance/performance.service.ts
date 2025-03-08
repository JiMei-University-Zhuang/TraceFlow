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
}
