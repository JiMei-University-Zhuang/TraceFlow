import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceMetricDto } from './dto/performance-metric.dto';
import { QueryMetricDto } from './dto/query-metric.dto';
import { QueryTimeRangeDto } from './dto/query-time-range.dto';
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

  @Get('metrics/timerange')
  async getMetricsByTimeRange(
    @Query() query: QueryTimeRangeDto,
  ): Promise<ApiResponse<{ metrics: PerformanceMetricDto[] }>> {
    let { startTime, endTime } = query;
    const { range, limit } = query;

    // 如果提供了相对时间范围
    if (range) {
      const now = Date.now();
      const matches = range.match(/^(\d+)([hdw])$/);

      if (!matches) {
        throw new Error(
          '无效的时间范围格式。请使用如 1h（1小时）、1d（1天）等格式。',
        );
      }

      const [, value, unit] = matches;
      const duration = parseInt(value);

      switch (unit) {
        case 'h': // 小时
          startTime = now - duration * 60 * 60 * 1000;
          break;
        case 'd': // 天
          startTime = now - duration * 24 * 60 * 60 * 1000;
          break;
        case 'w': // 周
          startTime = now - duration * 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          throw new Error('不支持的时间单位。');
      }
      endTime = now;
    }

    if (!startTime || !endTime) {
      throw new Error('请提供时间范围或相对时间。');
    }

    const metrics = await this.performanceService.getMetricsByTimeRange(
      startTime,
      endTime,
      limit,
    );

    let message = `成功获取`;
    if (range) {
      message += `最近 ${range} `;
    } else {
      message += `${new Date(startTime).toLocaleString()} 至 ${new Date(endTime).toLocaleString()} `;
    }
    message += `的性能指标`;

    return new ApiResponse({ metrics }, message);
  }
}
