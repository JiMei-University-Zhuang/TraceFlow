import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorReport } from './entities/error-report.entity';
import { ErrorReportDto } from './dto/error-report.dto';
import { ErrorQueryDto } from './dto/error-query.dto';
import { ErrorSeverity, ErrorCategory } from './enums';

@Injectable()
export class ErrorMonitoringService {
  constructor(
    @InjectModel(ErrorReport.name) private errorReportModel: Model<ErrorReport>,
  ) {}

  async saveError(errorReport: ErrorReportDto): Promise<ErrorReport> {
    const newError = new this.errorReportModel(errorReport);
    return newError.save();
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
      release,
      startTime,
      endTime,
      searchText,
      tags,
      page = 1,
      pageSize = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = queryDto;

    // 构建查询条件
    const query: any = {};

    if (appId) query.appId = appId;
    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (errorUid) query.errorUid = errorUid;
    if (userId) query['context.userId'] = userId;
    if (environment) query['context.environment'] = environment;
    if (release) query['context.release'] = release;

    // 时间范围查询
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = startTime;
      if (endTime) query.timestamp.$lte = endTime;
    }

    // 标签查询
    if (tags && Object.keys(tags).length > 0) {
      Object.entries(tags).forEach(([key, value]) => {
        query[`context.tags.${key}`] = value;
      });
    }

    // 全文搜索
    if (searchText) {
      query.$or = [
        { message: { $regex: searchText, $options: 'i' } },
        { stack: { $regex: searchText, $options: 'i' } },
      ];
    }

    // 计算总数
    const total = await this.errorReportModel.countDocuments(query);

    // 排序和分页
    const sortOption: any = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * pageSize;

    // 执行查询
    const items = await this.errorReportModel
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .exec();

    return { items, total };
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
    // 构建时间范围查询
    const timeQuery: any = { appId };
    if (startTime || endTime) {
      timeQuery.timestamp = {};
      if (startTime) timeQuery.timestamp.$gte = startTime;
      if (endTime) timeQuery.timestamp.$lte = endTime;
    }

    // 获取总错误数
    const totalErrors = await this.errorReportModel.countDocuments(timeQuery);

    // 获取唯一错误数
    const uniqueErrors = await this.errorReportModel
      .distinct('errorUid', timeQuery)
      .then((ids) => ids.length);

    // 获取严重程度分布
    const severityPipeline = [
      { $match: timeQuery },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ];
    const severityResults =
      await this.errorReportModel.aggregate(severityPipeline);
    const severityDistribution = Object.values(ErrorSeverity).reduce(
      (acc, severity) => {
        acc[severity] = 0;
        return acc;
      },
      {} as Record<ErrorSeverity, number>,
    );
    severityResults.forEach((result) => {
      severityDistribution[result._id as ErrorSeverity] = result.count;
    });

    // 获取分类分布
    const categoryPipeline = [
      { $match: timeQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ];
    const categoryResults =
      await this.errorReportModel.aggregate(categoryPipeline);
    const categoryDistribution = Object.values(ErrorCategory).reduce(
      (acc, category) => {
        acc[category] = 0;
        return acc;
      },
      {} as Record<ErrorCategory, number>,
    );
    categoryResults.forEach((result) => {
      categoryDistribution[result._id as ErrorCategory] = result.count;
    });

    // 获取时间分布
    // 根据时间范围确定时间间隔
    const interval = this.calculateTimeInterval(startTime, endTime);
    const timeDistribution = await this.getTimeDistribution(
      timeQuery,
      interval,
    );

    // 获取前10个最常见错误
    const topErrorsPipeline = [
      { $match: timeQuery },
      {
        $group: {
          _id: { errorUid: '$errorUid', message: '$message' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } as any },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          errorUid: '$_id.errorUid',
          message: '$_id.message',
          count: 1,
        },
      },
    ];
    const topErrors = await this.errorReportModel.aggregate(
      topErrorsPipeline as any,
    );

    return {
      totalErrors,
      uniqueErrors,
      severityDistribution,
      categoryDistribution,
      timeDistribution,
      topErrors,
    };
  }

  private calculateTimeInterval(startTime?: number, endTime?: number): number {
    if (!startTime || !endTime) return 24 * 60 * 60 * 1000; // 默认1天
    const range = endTime - startTime;
    if (range <= 24 * 60 * 60 * 1000) return 60 * 60 * 1000; // 1小时
    if (range <= 7 * 24 * 60 * 60 * 1000) return 24 * 60 * 60 * 1000; // 1天
    if (range <= 30 * 24 * 60 * 60 * 1000) return 7 * 24 * 60 * 60 * 1000; // 1周
    return 30 * 24 * 60 * 60 * 1000; // 1个月
  }

  private async getTimeDistribution(
    timeQuery: any,
    interval: number,
  ): Promise<Array<{ timestamp: number; count: number }>> {
    const pipeline = [
      { $match: timeQuery },
      {
        $group: {
          _id: {
            $subtract: ['$timestamp', { $mod: ['$timestamp', interval] }],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } as any },
      { $project: { _id: 0, timestamp: '$_id', count: 1 } },
    ];

    return this.errorReportModel.aggregate(pipeline as any);
  }

  async getErrorDetail(errorUid: string): Promise<ErrorReport> {
    const error = await this.errorReportModel.findOne({ errorUid }).exec();
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
      case 'day':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = now - 24 * 60 * 60 * 1000;
    }

    const timeQuery = { appId, timestamp: { $gte: startTime } };

    // 获取总错误数
    const totalErrors = await this.errorReportModel.countDocuments(timeQuery);

    // 获取严重错误数
    const criticalErrors = await this.errorReportModel.countDocuments({
      ...timeQuery,
      severity: ErrorSeverity.CRITICAL,
    });

    // 获取最近错误趋势
    const interval = this.calculateTimeInterval(startTime, now);
    const recentErrors = await this.getTimeDistribution(timeQuery, interval);

    // 获取前5个最常见问题
    const topIssuesPipeline = [
      { $match: timeQuery },
      {
        $group: {
          _id: { errorUid: '$errorUid', message: '$message' },
          count: { $sum: 1 },
          lastSeen: { $max: '$timestamp' },
        },
      },
      { $sort: { count: -1 } as any },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          errorUid: '$_id.errorUid',
          message: '$_id.message',
          count: 1,
          lastSeen: 1,
        },
      },
    ];
    const topIssues = await this.errorReportModel.aggregate(
      topIssuesPipeline as any,
    );

    return {
      totalErrors,
      criticalErrors,
      recentErrors,
      topIssues,
    };
  }
}
