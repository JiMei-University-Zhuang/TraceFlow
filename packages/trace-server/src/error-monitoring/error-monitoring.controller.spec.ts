import { Test, TestingModule } from '@nestjs/testing';
import { ErrorMonitoringController } from './error-monitoring.controller';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorSeverity, ErrorCategory } from './dto/error-report.dto';

describe('ErrorMonitoringController', () => {
  let controller: ErrorMonitoringController;
  let service: ErrorMonitoringService;

  const mockErrorReport = {
    type: 'error',
    message: 'Test error',
    stack: 'Error: Test error\n    at Test.func',
    timestamp: Date.now(),
    errorUid: '123e4567-e89b-12d3-a456-426614174000',
    url: 'http://localhost:3000',
    userAgent: 'Mozilla/5.0',
    platform: 'MacIntel',
    appId: '123e4567-e89b-12d3-a456-426614174001',
    context: {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.RUNTIME,
      environment: 'test',
      sessionId: 'test-session',
    },
    mechanism: {
      type: 'js',
      handled: true,
    },
    meta: {},
  };

  const mockErrorMonitoringService = {
    saveError: jest.fn(),
    queryErrors: jest.fn(),
    getErrorStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ErrorMonitoringController],
      providers: [
        {
          provide: ErrorMonitoringService,
          useValue: mockErrorMonitoringService,
        },
      ],
    }).compile();

    controller = module.get<ErrorMonitoringController>(
      ErrorMonitoringController,
    );
    service = module.get<ErrorMonitoringService>(ErrorMonitoringService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reportError', () => {
    it('should save error report successfully', async () => {
      mockErrorMonitoringService.saveError.mockResolvedValue(mockErrorReport);

      const result = await controller.reportError(mockErrorReport);

      expect(service.saveError).toHaveBeenCalledWith(mockErrorReport);
      expect(result).toEqual({
        success: true,
        data: mockErrorReport,
        message: '错误报告已成功保存',
      });
    });
  });

  describe('queryErrors', () => {
    it('should query errors with filters', async () => {
      const mockQuery = {
        appId: mockErrorReport.appId,
        severity: ErrorSeverity.HIGH,
        page: 1,
        pageSize: 20,
      };

      const mockQueryResult = {
        data: [mockErrorReport],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      mockErrorMonitoringService.queryErrors.mockResolvedValue(mockQueryResult);

      const result = await controller.queryErrors(mockQuery);

      expect(service.queryErrors).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual({
        success: true,
        data: mockQueryResult,
        message: '查询成功',
      });
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', async () => {
      const appId = mockErrorReport.appId;
      const startTime = '2024-03-15T00:00:00Z';
      const endTime = '2024-03-15T23:59:59Z';

      const mockStats = {
        total: 1,
        bySeverity: { [ErrorSeverity.HIGH]: 1 },
        byCategory: { [ErrorCategory.RUNTIME]: 1 },
        timeDistribution: [],
        topErrors: [],
      };

      mockErrorMonitoringService.getErrorStats.mockResolvedValue(mockStats);

      const result = await controller.getErrorStats(appId, startTime, endTime);

      expect(service.getErrorStats).toHaveBeenCalledWith(
        appId,
        startTime,
        endTime,
      );
      expect(result).toEqual({
        success: true,
        data: mockStats,
        message: '统计数据获取成功',
      });
    });
  });

  describe('getErrorDetails', () => {
    it('should return error details when found', async () => {
      const errorUid = mockErrorReport.errorUid;
      const mockQueryResult = {
        data: [mockErrorReport],
        total: 1,
        page: 1,
        pageSize: 1,
        totalPages: 1,
      };

      mockErrorMonitoringService.queryErrors.mockResolvedValue(mockQueryResult);

      const result = await controller.getErrorDetails(errorUid);

      expect(service.queryErrors).toHaveBeenCalledWith({
        errorUid,
        page: 1,
        pageSize: 1,
      });
      expect(result).toEqual({
        success: true,
        data: mockErrorReport,
        message: '错误详情获取成功',
      });
    });

    it('should return error when not found', async () => {
      const errorUid = 'non-existent-id';
      const mockQueryResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 1,
        totalPages: 0,
      };

      mockErrorMonitoringService.queryErrors.mockResolvedValue(mockQueryResult);

      const result = await controller.getErrorDetails(errorUid);

      expect(result).toEqual({
        success: false,
        message: '未找到指定的错误记录',
      });
    });
  });

  describe('getAppErrorSummary', () => {
    it('should return app error summary for 24h period', async () => {
      const appId = mockErrorReport.appId;
      const period = '24h';

      const mockStats = {
        total: 1,
        bySeverity: { [ErrorSeverity.HIGH]: 1 },
        byCategory: { [ErrorCategory.RUNTIME]: 1 },
        timeDistribution: [],
        topErrors: [],
      };

      mockErrorMonitoringService.getErrorStats.mockResolvedValue(mockStats);

      const result = await controller.getAppErrorSummary(appId, period);

      expect(service.getErrorStats).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('period', '24h');
      expect(result.data).toHaveProperty('startTime');
      expect(result.data).toHaveProperty('endTime');
    });

    it('should handle different time periods correctly', async () => {
      const appId = mockErrorReport.appId;
      const periods: Array<'24h' | '7d' | '30d'> = ['24h', '7d', '30d'];

      const mockStats = {
        total: 1,
        bySeverity: { [ErrorSeverity.HIGH]: 1 },
        byCategory: { [ErrorCategory.RUNTIME]: 1 },
        timeDistribution: [],
        topErrors: [],
      };

      mockErrorMonitoringService.getErrorStats.mockResolvedValue(mockStats);

      for (const period of periods) {
        const result = await controller.getAppErrorSummary(appId, period);
        expect(result.success).toBe(true);
        expect(result.data.period).toBe(period);
      }
    });
  });
});
