import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceMetricDto } from './dto/performance-metric.dto';
import { QueryMetricDto } from './dto/query-metric.dto';
import { ApiResponse } from '../common/dto/api-response.dto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post('metrics')
  async saveMetric(
    @Body() metric: PerformanceMetricDto,
  ): Promise<ApiResponse<PerformanceMetricDto>> {
    const savedMetric = await this.performanceService.saveMetric(metric);
    return new ApiResponse(savedMetric, '性能指标保存成功');
  }

  @Get('metrics')
  async getMetricsByName(
    @Query() query: QueryMetricDto,
  ): Promise<ApiResponse<{ metrics: PerformanceMetricDto[] }>> {
    const metrics = await this.performanceService.getMetricsByName(
      query.metricName,
    );
    return new ApiResponse(
      { metrics },
      `成功获取 ${query.metricName} 的性能指标`,
    );
  }
}
