import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PerformanceService } from '../src/performance/performance.service';

describe('EventsController (e2e) - Batch Processing', () => {
  let app: INestApplication;

  // 模拟保存指标的方法
  const mockSaveMetric = jest.fn().mockImplementation((metric) => {
    return Promise.resolve(metric);
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PerformanceService)
      .useValue({
        saveMetric: mockSaveMetric,
        getMetricsByName: jest.fn(),
        getMetricsByTimeRange: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('/events/batch (POST) - should process batch events correctly', async () => {
    // 模拟SDK发送的批量事件数据
    const batchEvents = [
      {
        eventType: 'performance',
        timestamp: Date.now(),
        pageUrl: 'http://localhost:3000/test',
        eventData: {
          LCP: 2500,
          FCP: 1200,
          CLS: 0.1,
          TTFB: 800,
        },
      },
      {
        eventType: 'behavior_click',
        timestamp: Date.now(),
        pageUrl: 'http://localhost:3000/test',
        eventData: {
          element: 'button',
          content: 'Submit',
        },
      },
      // 再添加一个性能事件，测试多个性能指标的处理
      {
        eventType: 'performance',
        timestamp: Date.now(),
        pageUrl: 'http://localhost:3000/other-page',
        eventData: {
          LCP: 3000,
          FP: 900,
        },
      },
    ];

    // 发送请求到批量处理接口
    const response = await request(app.getHttpServer())
      .post('/events/batch')
      .send(batchEvents)
      .expect(200);

    // 验证响应
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('total', 3);
    expect(response.body.data).toHaveProperty('processed', 2); // 只有2个性能事件被处理
    expect(response.body.data.byType).toHaveProperty('performance', 2);

    // 验证性能指标处理方法被调用了正确的次数
    // 第一个性能事件有4个指标，第二个有2个指标，总共应该调用6次
    expect(mockSaveMetric).toHaveBeenCalledTimes(6);

    // 验证调用参数包含正确的指标名称和值
    expect(mockSaveMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        metricName: 'LCP',
        value: 2500,
      }),
    );

    expect(mockSaveMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        metricName: 'FCP',
        value: 1200,
      }),
    );

    expect(mockSaveMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        metricName: 'LCP',
        value: 3000,
      }),
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
