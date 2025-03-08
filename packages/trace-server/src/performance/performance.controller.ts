import { Controller, Post, Body } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceMetricDto } from './dto/performance-metric.dto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post('metrics')
  async saveMetric(@Body() metric: PerformanceMetricDto) {
    return this.performanceService.saveMetric(metric);
  }
}
