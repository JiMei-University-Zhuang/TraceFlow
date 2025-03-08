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
}
