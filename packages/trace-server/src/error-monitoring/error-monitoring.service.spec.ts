import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReport } from './entities/error-report.entity';
import { ErrorSeverity, ErrorCategory } from './dto/error-report.dto';

describe('ErrorMonitoringService', () => {
  let service: ErrorMonitoringService;
  let repository: Repository<ErrorReport>;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorMonitoringService,
        {
          provide: getRepositoryToken(ErrorReport),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ErrorMonitoringService>(ErrorMonitoringService);
    repository = module.get<Repository<ErrorReport>>(
      getRepositoryToken(ErrorReport),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveError', () => {
    it('should save error report successfully', async () => {
      mockRepository.create.mockReturnValue(mockErrorReport);
      mockRepository.save.mockResolvedValue(mockErrorReport);

      const result = await service.saveError(mockErrorReport);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: mockErrorReport.type,
          message: mockErrorReport.message,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockErrorReport);
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

      mockRepository.findAndCount.mockResolvedValue([[mockErrorReport], 1]);

      const result = await service.queryErrors(mockQuery);

      expect(repository.findAndCount).toHaveBeenCalled();
      expect(result).toEqual({
        data: [mockErrorReport],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', async () => {
      const appId = mockErrorReport.appId;
      const startTime = '2024-03-15T00:00:00Z';
      const endTime = '2024-03-15T23:59:59Z';

      mockRepository.find.mockResolvedValue([mockErrorReport]);

      const result = await service.getErrorStats(appId, startTime, endTime);

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('bySeverity');
      expect(result).toHaveProperty('byCategory');
      expect(result).toHaveProperty('timeDistribution');
      expect(result).toHaveProperty('topErrors');
      expect(result.bySeverity[ErrorSeverity.HIGH]).toBe(1);
      expect(result.byCategory[ErrorCategory.RUNTIME]).toBe(1);
    });
  });

  describe('error statistics calculation', () => {
    it('should calculate severity distribution correctly', () => {
      const errors = [
        { ...mockErrorReport },
        {
          ...mockErrorReport,
          context: {
            ...mockErrorReport.context,
            severity: ErrorSeverity.CRITICAL,
          },
        },
      ];

      const result = service['countBySeverity'](errors as ErrorReport[]);

      expect(result[ErrorSeverity.HIGH]).toBe(1);
      expect(result[ErrorSeverity.CRITICAL]).toBe(1);
      expect(result[ErrorSeverity.MEDIUM]).toBe(0);
    });

    it('should calculate category distribution correctly', () => {
      const errors = [
        { ...mockErrorReport },
        {
          ...mockErrorReport,
          context: {
            ...mockErrorReport.context,
            category: ErrorCategory.NETWORK,
          },
        },
      ];

      const result = service['countByCategory'](errors as ErrorReport[]);

      expect(result[ErrorCategory.RUNTIME]).toBe(1);
      expect(result[ErrorCategory.NETWORK]).toBe(1);
      expect(result[ErrorCategory.SYNTAX]).toBe(0);
    });

    it('should calculate time distribution correctly', () => {
      const now = new Date();
      const errors = [
        { ...mockErrorReport, timestamp: now.getTime() },
        { ...mockErrorReport, timestamp: now.getTime() - 3600000 }, // 1 hour ago
      ];

      const result = service['getTimeDistribution'](errors as ErrorReport[]);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(24); // 24 hours
      expect(result.some((item) => item.count > 0)).toBe(true);
    });

    it('should calculate top errors correctly', () => {
      const errors = [
        { ...mockErrorReport },
        { ...mockErrorReport }, // Duplicate error
        {
          ...mockErrorReport,
          message: 'Different error',
          context: {
            ...mockErrorReport.context,
            severity: ErrorSeverity.CRITICAL,
          },
        },
      ];

      const result = service['getTopErrors'](errors as ErrorReport[]);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
      expect(result[0].count).toBe(2); // Most frequent error
      expect(result[1].count).toBe(1); // Less frequent error
    });
  });
});
