import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PerformanceMetricDto } from './dto/performance-metric.dto';
import { PerformanceMetric } from './entities/performance-metric.entity';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceMetric)
    private performanceRepository: Repository<PerformanceMetric>,
  ) {}

  // 保存性能指标数据
  async saveMetric(
    metricDto: PerformanceMetricDto,
  ): Promise<PerformanceMetric> {
    const metric = this.performanceRepository.create(metricDto);
    return this.performanceRepository.save(metric);
  }

  // 获取指定名称的性能指标
  async getMetricsByName(metricName: string): Promise<PerformanceMetric[]> {
    return this.performanceRepository.find({
      where: { metricName },
      order: { timestamp: 'DESC' },
    });
  }

  // 获取指定时间范围内的性能指标
  async getMetricsByTimeRange(
    startTime: number,
    endTime: number,
    limit?: number,
  ): Promise<PerformanceMetric[]> {
    return this.performanceRepository.find({
      where: {
        timestamp: Between(startTime, endTime),
      },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
