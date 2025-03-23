import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { ErrorReport } from './entities/error-report.entity';
import { ErrorReportDto } from './dto/error-report.dto';
import { ErrorQueryDto } from './dto/error-query.dto';
import { ErrorSeverity, ErrorCategory } from './enums';

// 模拟数据类型，替代 MongoDB 模型
interface ErrorReport {
  _id?: string;
  id?: string;
  appId: string;
  errorUid: string;
  message: string;
  stack?: string;
  type?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  url?: string;
  userAgent?: string;
  context?: any;
  metadata?: any;
  [key: string]: any;
}

@Injectable()
export class ErrorMonitoringService {
  // 使用内存数据代替数据库
  private errorReports: ErrorReport[] = [];
  private nextId = 1;

  constructor() {
    // 初始化一些测试数据
    this.generateMockData();
  }

  // 生成模拟数据
  private generateMockData() {
    const now = Date.now();
    const mockErrors: ErrorReport[] = [
      {
        _id: '1',
        appId: 'test-app',
        errorUid: 'err-001',
        message: '未捕获的 JavaScript 错误',
        stack: 'Error: 未捕获的错误\n    at test.js:10:5',
        type: 'JS_ERROR',
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.RUNTIME,
        timestamp: now - 3600000,
        url: 'https://example.com/page1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        context: { userId: 'user1', environment: 'production' },
      },
      {
        _id: '2',
        appId: 'test-app',
        errorUid: 'err-002',
        message: '资源加载失败',
        type: 'RESOURCE_ERROR',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.RESOURCE,
        timestamp: now - 7200000,
        url: 'https://example.com/page2',
        context: { userId: 'user2', environment: 'production' },
      },
    ];

    this.errorReports = mockErrors;
    this.nextId = mockErrors.length + 1;
  }

  async saveError(errorReport: ErrorReportDto): Promise<ErrorReport> {
    // 从 DTO 提取必要字段创建 ErrorReport 对象
    const newError: ErrorReport = {
      _id: String(this.nextId++),
      appId: errorReport.appId,
      errorUid: errorReport.errorUid,
      message: errorReport.message,
      stack: errorReport.stack,
      type: errorReport.type,
      severity: errorReport.context.severity,
      category: errorReport.context.category,
      timestamp: errorReport.timestamp || Date.now(),
      url: errorReport.url,
      userAgent: errorReport.userAgent,
      context: errorReport.context,
      metadata: errorReport.meta,
    };
    this.errorReports.push(newError);
    return Promise.resolve(newError);
  }

  async queryErrors(
    queryDto: ErrorQueryDto,
  ): Promise<{ items: ErrorReport[]; total: number }> {
    const {
      appId,
      severity,
      category,
      errorUid,
      userId,
      environment,
      page = 1,
      pageSize = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = queryDto;

    // 简单的内存过滤
    let filtered = [...this.errorReports];

    if (appId) filtered = filtered.filter((err) => err.appId === appId);
    if (severity)
      filtered = filtered.filter((err) => err.severity === severity);
    if (category)
      filtered = filtered.filter((err) => err.category === category);
    if (errorUid)
      filtered = filtered.filter((err) => err.errorUid === errorUid);
    if (userId)
      filtered = filtered.filter((err) => err.context?.userId === userId);
    if (environment)
      filtered = filtered.filter(
        (err) => err.context?.environment === environment,
      );

    // 排序
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const order = sortOrder === 'asc' ? 1 : -1;

      return (aValue > bValue ? 1 : -1) * order;
    });

    // 分页
    const skip = (page - 1) * pageSize;
    const items = filtered.slice(skip, skip + pageSize);

    return { items, total: filtered.length };
  }

  async getErrorStats(
    appId: string,
    startTime?: number,
    endTime?: number,
  ): Promise<{
    totalErrors: number;
    uniqueErrors: number;
    severityDistribution: Record<ErrorSeverity, number>;
    categoryDistribution: Record<ErrorCategory, number>;
    timeDistribution: Array<{ timestamp: number; count: number }>;
    topErrors: Array<{ errorUid: string; message: string; count: number }>;
  }> {
    // 根据时间和应用ID过滤
    let filtered = this.errorReports.filter((err) => err.appId === appId);
    if (startTime)
      filtered = filtered.filter((err) => err.timestamp >= startTime);
    if (endTime) filtered = filtered.filter((err) => err.timestamp <= endTime);

    // 计算唯一错误数
    const uniqueErrorUids = new Set(filtered.map((err) => err.errorUid));

    // 计算严重性分布
    const severityDistribution = Object.values(ErrorSeverity).reduce(
      (acc, severity) => {
        acc[severity] = filtered.filter(
          (err) => err.severity === severity,
        ).length;
        return acc;
      },
      {} as Record<ErrorSeverity, number>,
    );

    // 计算分类分布
    const categoryDistribution = Object.values(ErrorCategory).reduce(
      (acc, category) => {
        acc[category] = filtered.filter(
          (err) => err.category === category,
        ).length;
        return acc;
      },
      {} as Record<ErrorCategory, number>,
    );

    // 简化的时间分布
    const timeDistribution = [
      { timestamp: Date.now() - 86400000, count: 5 },
      { timestamp: Date.now() - 43200000, count: 8 },
      { timestamp: Date.now(), count: 3 },
    ];

    // 计算前10个最常见错误
    const errorCounts = filtered.reduce(
      (acc, err) => {
        const key = err.errorUid;
        if (!acc[key]) {
          acc[key] = {
            errorUid: err.errorUid,
            message: err.message,
            count: 0,
          };
        }
        acc[key].count++;
        return acc;
      },
      {} as Record<
        string,
        { errorUid: string; message: string; count: number }
      >,
    );

    const topErrors = Object.values(errorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: filtered.length,
      uniqueErrors: uniqueErrorUids.size,
      severityDistribution,
      categoryDistribution,
      timeDistribution,
      topErrors,
    };
  }

  async getErrorDetail(errorUid: string): Promise<ErrorReport> {
    const error = this.errorReports.find((err) => err.errorUid === errorUid);
    if (!error) {
      throw new NotFoundException(`Error with UID ${errorUid} not found`);
    }
    return error;
  }

  async getAppErrorSummary(
    appId: string,
    period: 'day' | 'week' | 'month' = 'day',
  ): Promise<{
    totalErrors: number;
    criticalErrors: number;
    recentErrors: Array<{ timestamp: number; count: number }>;
    topIssues: Array<{
      errorUid: string;
      message: string;
      count: number;
      lastSeen: number;
    }>;
  }> {
    // 计算时间范围
    const now = Date.now();
    let startTime: number;

    switch (period) {
      case 'week':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'day':
      default:
        startTime = now - 24 * 60 * 60 * 1000;
    }

    // 过滤符合条件的错误
    const filtered = this.errorReports.filter(
      (err) => err.appId === appId && err.timestamp >= startTime,
    );

    // 计算关键指标
    const totalErrors = filtered.length;
    const criticalErrors = filtered.filter(
      (err) => err.severity === ErrorSeverity.CRITICAL,
    ).length;

    // 简化的最近错误趋势
    const recentErrors = [
      { timestamp: now - 24 * 60 * 60 * 1000, count: 3 },
      { timestamp: now - 18 * 60 * 60 * 1000, count: 5 },
      { timestamp: now - 12 * 60 * 60 * 1000, count: 7 },
      { timestamp: now - 6 * 60 * 60 * 1000, count: 4 },
      { timestamp: now, count: 2 },
    ];

    // 计算前5个最严重问题
    const errorMap = new Map<
      string,
      {
        errorUid: string;
        message: string;
        count: number;
        lastSeen: number;
      }
    >();

    filtered.forEach((err) => {
      const existing = errorMap.get(err.errorUid);

      if (!existing) {
        errorMap.set(err.errorUid, {
          errorUid: err.errorUid,
          message: err.message,
          count: 1,
          lastSeen: err.timestamp,
        });
      } else {
        existing.count++;
        existing.lastSeen = Math.max(existing.lastSeen, err.timestamp);
      }
    });

    const topIssues = Array.from(errorMap.values())
      .sort((a, b) => {
        // 首先按严重性排序，然后按计数排序
        const aErr = this.errorReports.find(
          (err) => err.errorUid === a.errorUid,
        );
        const bErr = this.errorReports.find(
          (err) => err.errorUid === b.errorUid,
        );

        const severityOrder = {
          [ErrorSeverity.CRITICAL]: 3,
          [ErrorSeverity.HIGH]: 2,
          [ErrorSeverity.MEDIUM]: 1,
          [ErrorSeverity.LOW]: 0,
        };

        const aSeverity = aErr ? severityOrder[aErr.severity] : 0;
        const bSeverity = bErr ? severityOrder[bErr.severity] : 0;

        if (aSeverity !== bSeverity) {
          return bSeverity - aSeverity;
        }

        return b.count - a.count;
      })
      .slice(0, 5);

    return {
      totalErrors,
      criticalErrors,
      recentErrors,
      topIssues,
    };
  }

  // 其余方法也可以类似实现...
}
