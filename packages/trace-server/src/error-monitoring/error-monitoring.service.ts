import { Injectable } from '@nestjs/common';
import { ErrorReportDto } from './dto/error-report.dto';

@Injectable()
export class ErrorMonitoringService {
  private errors: ErrorReportDto[] = [];

  async saveError(errorReport: ErrorReportDto): Promise<ErrorReportDto> {
    // 暂时将错误存储在内存中，后续可以替换为数据库存储
    const savedError = {
      ...errorReport,
      errorId: this.errors.length + 1,
    };
    this.errors.push(savedError);
    return savedError;
  }
}
