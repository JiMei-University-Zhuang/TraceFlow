import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReport } from './entities/error-report.entity';

describe('ErrorMonitoringService', () => {
  let service: ErrorMonitoringService;

  const mockModel = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    countDocuments: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue([]),
    distinct: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorMonitoringService,
        {
          provide: getModelToken(ErrorReport.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ErrorMonitoringService>(ErrorMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
