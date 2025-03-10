import { Injectable } from '@nestjs/common';
import { ErrorReportDto } from './dto/error-report.dto';
import { ErrorQueryDto, ErrorType } from './dto/error-query.dto';

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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

  async queryErrors(
    query: ErrorQueryDto,
  ): Promise<PaginatedResult<ErrorReportDto>> {
    let filteredErrors = [...this.errors];

    // 按时间范围筛选
    if (query.startTime) {
      filteredErrors = filteredErrors.filter(
        (error) => error.timestamp >= query.startTime,
      );
    }
    if (query.endTime) {
      filteredErrors = filteredErrors.filter(
        (error) => error.timestamp <= query.endTime,
      );
    }

    // 按错误类型筛选
    if (query.type) {
      filteredErrors = filteredErrors.filter(
        (error) => error.type === query.type,
      );
    }

    // 按用户ID筛选
    if (query.userId) {
      filteredErrors = filteredErrors.filter(
        (error) => error.userId === query.userId,
      );
    }

    // 计算分页信息
    const total = filteredErrors.length;
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // 获取当前页的数据
    const items = filteredErrors.slice(startIndex, endIndex);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getErrorStats(): Promise<{
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    uniqueUsers: number;
  }> {
    const errorsByType = this.errors.reduce(
      (acc, error) => {
        const type = error.type as ErrorType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<ErrorType, number>,
    );

    const uniqueUsers = new Set(
      this.errors.filter((error) => error.userId).map((error) => error.userId),
    ).size;

    return {
      totalErrors: this.errors.length,
      errorsByType,
      uniqueUsers,
    };
  }
}
