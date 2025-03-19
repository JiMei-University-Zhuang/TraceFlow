import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReportDto } from './dto/error-report.dto';
import { ErrorQueryDto } from './dto/error-query.dto';

// 定义返回类型
interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Controller('error-monitoring')
export class ErrorMonitoringController {
  constructor(
    private readonly errorMonitoringService: ErrorMonitoringService,
  ) {}

  @Post('report')
  async reportError(
    @Body(ValidationPipe) errorReport: ErrorReportDto,
  ): Promise<SuccessResponse<unknown>> {
    const savedError = await this.errorMonitoringService.saveError(errorReport);
    return {
      success: true,
      data: savedError,
      message: '错误报告已成功保存',
    };
  }

  @Get('query')
  async queryErrors(
    @Query(ValidationPipe) query: ErrorQueryDto,
  ): Promise<SuccessResponse<unknown>> {
    const result = await this.errorMonitoringService.queryErrors(query);
    return {
      success: true,
      data: result,
      message: '查询成功',
    };
  }

  @Get('stats/:appId')
  async getErrorStats(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<SuccessResponse<unknown>> {
    const startTimestamp = startTime
      ? new Date(startTime).getTime()
      : undefined;
    const endTimestamp = endTime ? new Date(endTime).getTime() : undefined;

    const stats = await this.errorMonitoringService.getErrorStats(
      appId,
      startTimestamp,
      endTimestamp,
    );
    return {
      success: true,
      data: stats,
      message: '统计数据获取成功',
    };
  }

  @Get('details/:errorUid')
  async getErrorDetails(
    @Param('errorUid', ParseUUIDPipe) errorUid: string,
  ): Promise<SuccessResponse<unknown> | { success: boolean; message: string }> {
    const result = await this.errorMonitoringService.queryErrors({
      errorUid,
      page: 1,
      pageSize: 1,
    });

    if (result.items.length === 0) {
      return {
        success: false,
        message: '未找到指定的错误记录',
      };
    }

    return {
      success: true,
      data: result.items[0],
      message: '错误详情获取成功',
    };
  }

  @Get('apps/:appId/summary')
  async getAppErrorSummary(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Query('period') period: '24h' | '7d' | '30d' = '24h',
  ): Promise<SuccessResponse<unknown>> {
    const now = new Date();
    let startTime: Date;

    switch (period) {
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const stats = await this.errorMonitoringService.getErrorStats(
      appId,
      startTime.getTime(),
      now.getTime(),
    );

    return {
      success: true,
      data: {
        ...stats,
        period,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
      },
      message: '应用错误概览获取成功',
    };
  }
}
