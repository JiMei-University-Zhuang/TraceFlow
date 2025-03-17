import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoClient, Db } from 'mongodb';
import { AppModule } from '../src/app.module';
import { ErrorSeverity, ErrorCategory } from '../src/error-monitoring/enums';

describe('ErrorMonitoring (e2e)', () => {
  let app: INestApplication;
  let mongoClient: MongoClient;
  let db: Db;

  beforeAll(async () => {
    // 连接到测试数据库
    mongoClient = await MongoClient.connect('mongodb://localhost:27017');
    db = mongoClient.db('traceflow_test');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    // 清理测试数据
    await db.collection('error_reports').deleteMany({});
  });

  afterAll(async () => {
    await app.close();
    await mongoClient.close();
  });

  const testError = {
    type: 'js_error',
    message: 'Test error message',
    stack: 'Error: Test error message\n    at Test.func (/test.js:1:1)',
    timestamp: Date.now(),
    errorUid: 'test-error-001',
    url: 'http://localhost:3000/test',
    userAgent: 'Mozilla/5.0 (Test)',
    platform: 'test',
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.RUNTIME,
    context: {
      environment: 'test',
      tags: { test: 'true' },
      deviceInfo: {
        os: 'test',
        browser: 'test',
        device: 'test',
      },
      networkInfo: {
        effectiveType: '4g',
      },
    },
    appId: 'test-app',
  };

  describe('/error-monitoring/report (POST)', () => {
    it('should create a new error report', () => {
      return request(app.getHttpServer())
        .post('/error-monitoring/report')
        .send(testError)
        .expect(201)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.errorUid).toBe(testError.errorUid);
        });
    });
  });

  describe('/error-monitoring/query (GET)', () => {
    beforeEach(async () => {
      // 插入测试数据
      await db.collection('error_reports').insertOne(testError);
    });

    it('should query errors with filters', () => {
      return request(app.getHttpServer())
        .get('/error-monitoring/query')
        .query({
          appId: 'test-app',
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.RUNTIME,
          startTime: Date.now() - 3600000, // 1小时前
          endTime: Date.now(),
        })
        .expect(200)
        .then((response) => {
          expect(response.body.items).toBeDefined();
          expect(response.body.items.length).toBe(1);
          expect(response.body.items[0].errorUid).toBe(testError.errorUid);
        });
    });
  });

  describe('/error-monitoring/stats/:appId (GET)', () => {
    beforeEach(async () => {
      // 插入多条测试数据
      await db.collection('error_reports').insertMany([
        testError,
        {
          ...testError,
          errorUid: 'test-error-002',
          severity: ErrorSeverity.LOW,
          category: ErrorCategory.NETWORK,
        },
      ]);
    });

    it('should get error statistics', () => {
      return request(app.getHttpServer())
        .get('/error-monitoring/stats/test-app')
        .query({
          startTime: Date.now() - 3600000,
          endTime: Date.now(),
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.totalErrors).toBe(2);
          expect(response.body.severityDistribution).toBeDefined();
          expect(response.body.categoryDistribution).toBeDefined();
        });
    });
  });

  describe('/error-monitoring/details/:errorUid (GET)', () => {
    beforeEach(async () => {
      await db.collection('error_reports').insertOne(testError);
    });

    it('should get error details', () => {
      return request(app.getHttpServer())
        .get(`/error-monitoring/details/${testError.errorUid}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.errorUid).toBe(testError.errorUid);
          expect(response.body.message).toBe(testError.message);
          expect(response.body.context).toBeDefined();
        });
    });
  });
});
