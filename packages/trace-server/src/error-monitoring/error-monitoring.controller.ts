import { Controller, Post, Body } from '@nestjs/common';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReportDto } from './dto/error-report.dto';

@Controller('error-monitoring')
export class ErrorMonitoringController {
  constructor(
    private readonly errorMonitoringService: ErrorMonitoringService,
  ) {}

  @Post('report')
  async reportError(@Body() errorReport: ErrorReportDto) {
    return this.errorMonitoringService.saveError(errorReport);
  }
}
