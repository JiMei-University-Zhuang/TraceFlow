import { Controller, Post, Body } from '@nestjs/common';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReportDto } from './dto/error-report.dto';
import { ApiResponse } from '../common/dto/api-response.dto';

@Controller('error-monitoring')
export class ErrorMonitoringController {
  constructor(
    private readonly errorMonitoringService: ErrorMonitoringService,
  ) {}

  @Post('report')
  async reportError(
    @Body() errorReport: ErrorReportDto,
  ): Promise<ApiResponse<ErrorReportDto>> {
    const savedError = await this.errorMonitoringService.saveError(errorReport);
    return new ApiResponse(savedError, '错误报告保存成功');
  }
}
