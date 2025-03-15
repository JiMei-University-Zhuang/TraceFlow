import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import { ErrorReport } from './entities/error-report.entity';
import { ErrorReportDto } from './dto/error-report.dto';
import { ErrorQueryDto } from './dto/error-query.dto';
import { ErrorSeverity, ErrorCategory } from './dto/error-report.dto';

@Injectable()
export class ErrorMonitoringService {
  constructor(
    @InjectRepository(ErrorReport)
    private readonly errorReportRepository: Repository<ErrorReport>,
  ) {}

  async saveError(errorReport: ErrorReportDto): Promise<ErrorReport> {
    const error = this.errorReportRepository.create({
      ...errorReport,
      context: errorReport.context,
      mechanism: errorReport.mechanism,
      meta: errorReport.meta,
      sampling: errorReport.sampling,
      breadcrumbs: errorReport.breadcrumbs,
    });

    return this.errorReportRepository.save(error);
  }

  async queryErrors(query: ErrorQueryDto) {
    const where: FindOptionsWhere<ErrorReport> = {};
    const {
      appId,
      severity,
      category,
      errorUid,
      userId,
      environment,
      release,
      startTime,
      endTime,
      searchText,
      tags,
      page = 1,
      pageSize = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = query;

    if (appId) {
      where.appId = appId;
    }

    if (severity) {
      where['context.severity'] = severity;
    }

    if (category) {
      where['context.category'] = category;
    }

    if (errorUid) {
      where.errorUid = errorUid;
    }

    if (userId) {
      where['context.userId'] = userId;
    }

    if (environment) {
      where['context.environment'] = environment;
    }

    if (release) {
      where['context.release'] = release;
    }

    if (startTime && endTime) {
      where.timestamp = Between(
        new Date(startTime).getTime(),
        new Date(endTime).getTime(),
      );
    }

    if (searchText) {
      where.message = Like(`%${searchText}%`);
    }

    if (tags && tags.length > 0) {
      where['context.tags'] = tags.reduce(
        (acc, tag) => ({
          ...acc,
          [tag]: true,
        }),
        {},
      );
    }

    const [errors, total] = await this.errorReportRepository.findAndCount({
      where,
      order: {
        [sortBy]: sortOrder.toUpperCase(),
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: errors,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getErrorStats(appId: string, startTime?: string, endTime?: string) {
    const timeRange =
      startTime && endTime
        ? Between(new Date(startTime).getTime(), new Date(endTime).getTime())
        : undefined;

    const errors = await this.errorReportRepository.find({
      where: {
        appId,
        ...(timeRange ? { timestamp: timeRange } : {}),
      },
    });

    const stats = {
      total: errors.length,
      bySeverity: this.countBySeverity(errors),
      byCategory: this.countByCategory(errors),
      timeDistribution: this.getTimeDistribution(errors),
      topErrors: this.getTopErrors(errors),
    };

    return stats;
  }

  private countBySeverity(errors: ErrorReport[]) {
    const counts = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    errors.forEach((error) => {
      counts[error.context.severity]++;
    });

    return counts;
  }

  private countByCategory(errors: ErrorReport[]) {
    const counts = {
      [ErrorCategory.RUNTIME]: 0,
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.RESOURCE]: 0,
      [ErrorCategory.PROMISE]: 0,
      [ErrorCategory.SYNTAX]: 0,
      [ErrorCategory.SECURITY]: 0,
      [ErrorCategory.CUSTOM]: 0,
    };

    errors.forEach((error) => {
      counts[error.context.category]++;
    });

    return counts;
  }

  private getTimeDistribution(errors: ErrorReport[]) {
    const distribution = new Map<string, number>();
    const now = new Date();
    const hourMs = 3600000; // 1 hour in milliseconds

    // Initialize last 24 hours with 0
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * hourMs);
      const key = time.toISOString().slice(0, 13); // Format: YYYY-MM-DDTHH
      distribution.set(key, 0);
    }

    // Count errors in each hour
    errors.forEach((error) => {
      const time = new Date(error.timestamp);
      const key = time.toISOString().slice(0, 13);
      if (distribution.has(key)) {
        distribution.set(key, distribution.get(key)! + 1);
      }
    });

    return Array.from(distribution.entries()).map(([time, count]) => ({
      time,
      count,
    }));
  }

  private getTopErrors(errors: ErrorReport[]) {
    const errorMap = new Map<string, { count: number; error: ErrorReport }>();

    errors.forEach((error) => {
      const key = `${error.message}:${error.context.category}`;
      if (errorMap.has(key)) {
        errorMap.get(key)!.count++;
      } else {
        errorMap.set(key, { count: 1, error });
      }
    });

    return Array.from(errorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ count, error }) => ({
        message: error.message,
        category: error.context.category,
        severity: error.context.severity,
        count,
        lastOccurrence: error.timestamp,
      }));
  }
}
