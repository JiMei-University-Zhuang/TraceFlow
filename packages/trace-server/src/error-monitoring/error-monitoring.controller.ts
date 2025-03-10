import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReportDto } from './dto/error-report.dto';
import { ErrorQueryDto } from './dto/error-query.dto';
import { ApiResponse } from '../common/dto/api-response.dto';

@Controller('error-monitoring')
export class ErrorMonitoringController {
  constructor(
    private readonly errorMonitoringService: ErrorMonitoringService,
  ) {}

  @Post('report')
  @HttpCode(HttpStatus.OK)
  async reportError(
    @Body() errorReport: ErrorReportDto,
  ): Promise<ApiResponse<ErrorReportDto>> {
    const savedError = await this.errorMonitoringService.saveError(errorReport);
    return new ApiResponse(savedError, '错误报告保存成功');
  }

  @Get('query')
  @HttpCode(HttpStatus.OK)
  async queryErrors(@Query() query: ErrorQueryDto): Promise<ApiResponse<any>> {
    const result = await this.errorMonitoringService.queryErrors(query);
    return new ApiResponse(result, '错误查询成功');
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getErrorStats(): Promise<ApiResponse<any>> {
    const stats = await this.errorMonitoringService.getErrorStats();
    return new ApiResponse(stats, '错误统计获取成功');
  }
}
