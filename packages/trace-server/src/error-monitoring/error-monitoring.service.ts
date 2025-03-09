import { Injectable } from '@nestjs/common';
import { ErrorReportDto } from './dto/error-report.dto';

@Injectable()
export class ErrorMonitoringService {
  private errors: ErrorReportDto[] = [];

  async saveError(errorReport: ErrorReportDto) {
    // 暂时将错误存储在内存中，后续可以替换为数据库存储
    this.errors.push(errorReport);
    return {
      success: true,
      message: 'Error report saved successfully',
      errorId: this.errors.length, // 简单使用数组长度作为错误ID
    };
  }
}
