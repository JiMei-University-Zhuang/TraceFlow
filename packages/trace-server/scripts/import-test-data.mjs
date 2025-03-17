/**
 * 错误监控测试数据导入脚本
 * 
 * 使用方法:
 * node scripts/import-test-data.js
 */

import { MongoClient } from 'mongodb';

// 连接配置
const uri = 'mongodb://localhost:27017';
const dbName = 'traceflow_dev';

// 错误严重程度
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// 错误分类
const ErrorCategory = {
  RUNTIME: 'runtime',
  SYNTAX: 'syntax',
  NETWORK: 'network',
  SECURITY: 'security',
  CUSTOM: 'custom',
  PERFORMANCE: 'performance',
  RESOURCE: 'resource',
  PROMISE: 'promise',
};

// 生成随机错误数据
function generateErrorData(count = 100) {
  const errors = [];
  const now = Date.now();
  const appIds = ['app-1', 'app-2', 'app-3'];
  const errorMessages = [
    'TypeError: Cannot read property of undefined',
    'ReferenceError: variable is not defined',
    'SyntaxError: Unexpected token',
    'NetworkError: Failed to fetch',
    'SecurityError: Permission denied',
    'Error: API request failed',
    'Error: Resource loading failed',
    'Error: Promise rejected',
  ];
  const urls = [
    'https://example.com/',
    'https://example.com/dashboard',
    'https://example.com/profile',
    'https://example.com/settings',
    'https://example.com/products',
  ];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  ];
  const platforms = ['Win32', 'MacIntel', 'iPhone'];
  const environments = ['production', 'staging', 'development'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const operatingSystems = ['Windows', 'MacOS', 'iOS', 'Android'];

  for (let i = 0; i < count; i++) {
    const appId = appIds[Math.floor(Math.random() * appIds.length)];
    const messageIndex = Math.floor(Math.random() * errorMessages.length);
    const errorType = messageIndex < 2 ? 'js_error' : 
                      messageIndex < 4 ? 'network_error' : 
                      messageIndex < 6 ? 'resource_error' : 'promise_error';
    const severity = messageIndex < 2 ? ErrorSeverity.HIGH : 
                     messageIndex < 4 ? ErrorSeverity.MEDIUM : 
                     messageIndex < 6 ? ErrorSeverity.LOW : ErrorSeverity.CRITICAL;
    const category = messageIndex < 2 ? ErrorCategory.RUNTIME : 
                     messageIndex < 4 ? ErrorCategory.NETWORK : 
                     messageIndex < 6 ? ErrorCategory.RESOURCE : ErrorCategory.PROMISE;
    
    // 随机时间，过去30天内
    const timestamp = now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    errors.push({
      errorUid: `error-${appId}-${i}`,
      type: errorType,
      message: errorMessages[messageIndex],
      stack: `Error: ${errorMessages[messageIndex]}\n    at Function.Module._load (internal/modules/cjs/loader.js:807:14)\n    at Module.require (internal/modules/cjs/loader.js:906:19)`,
      timestamp,
      url: urls[Math.floor(Math.random() * urls.length)],
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      appId,
      severity,
      category,
      context: {
        environment: environments[Math.floor(Math.random() * environments.length)],
        tags: {
          version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
          feature: Math.random() > 0.5 ? 'new-ui' : 'legacy',
        },
        deviceInfo: {
          os: operatingSystems[Math.floor(Math.random() * operatingSystems.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          device: devices[Math.floor(Math.random() * devices.length)],
          screenResolution: Math.random() > 0.5 ? '1920x1080' : '375x812',
        },
        networkInfo: {
          effectiveType: Math.random() > 0.3 ? '4g' : '3g',
          downlink: Math.floor(Math.random() * 10) + 1,
          rtt: Math.floor(Math.random() * 100) + 10,
        },
        sessionId: `session-${Math.floor(Math.random() * 1000)}`,
        userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
      },
      mechanism: {
        type: errorType.split('_')[0],
        handled: Math.random() > 0.3,
        data: {
          mode: Math.random() > 0.5 ? 'production' : 'development',
        },
      },
      sampling: {
        rate: 1.0,
        isSelected: true,
      },
      meta: {
        name: errorType,
        component: Math.random() > 0.5 ? 'frontend' : 'backend',
      },
    });
  }

  return errors;
}

async function importData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection('error_reports');

    // 清空集合
    await collection.deleteMany({});
    console.log('Cleared existing data');

    // 生成并导入测试数据
    const errors = generateErrorData(200);
    const result = await collection.insertMany(errors);
    console.log(`${result.insertedCount} error reports imported successfully`);

    // 创建索引
    await collection.createIndex({ timestamp: -1 });
    await collection.createIndex({ appId: 1 });
    await collection.createIndex({ errorUid: 1 }, { unique: true });
    await collection.createIndex({ 'context.userId': 1 });
    await collection.createIndex({ severity: 1 });
    await collection.createIndex({ category: 1 });
    console.log('Indexes created');

  } catch (err) {
    console.error('Error importing data:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// 执行导入
importData().catch(console.error); 