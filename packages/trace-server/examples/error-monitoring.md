# 错误监控 API 文档

## 概述

错误监控模块提供了一套完整的错误跟踪和分析功能，支持捕获、存储、查询和统计各类错误信息。

## API 端点

### 1. 上报错误

```http
POST /error-monitoring/report
```

上报一个新的错误事件。

#### 请求体

```typescript
{
  type: string;              // 错误类型
  message: string;           // 错误消息
  stack?: string;           // 错误堆栈（可选）
  timestamp: number;        // 时间戳
  errorUid: string;         // 错误唯一标识
  url: string;              // 发生错误的URL
  userAgent: string;        // 用户代理
  platform: string;         // 平台信息
  appId: string;           // 应用ID
  context: {
    severity: ErrorSeverity;    // 错误严重程度
    category: ErrorCategory;    // 错误类别
    environment: string;        // 环境
    sessionId: string;         // 会话ID
    userId?: string;           // 用户ID（可选）
    tags?: Record<string, string>;  // 标签
    deviceInfo?: {             // 设备信息
      os: string;
      browser: string;
      device: string;
      screenResolution?: string;
    };
    networkInfo?: {           // 网络信息
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  };
  mechanism: {              // 错误机制
    type: string;
    handled: boolean;
    data?: Record<string, unknown>;
  };
  meta: Record<string, unknown>;  // 元数据
}
```

#### 响应

```typescript
{
  success: boolean;
  data: ErrorReport;
  message: string;
}
```

### 2. 查询错误

```http
GET /error-monitoring/query
```

查询错误记录，支持多维度过滤和分页。

#### 查询参数

```typescript
{
  appId?: string;           // 应用ID
  severity?: ErrorSeverity;  // 错误严重程度
  category?: ErrorCategory;  // 错误类别
  errorUid?: string;        // 错误唯一标识
  userId?: string;          // 用户ID
  environment?: string;     // 环境
  release?: string;         // 发布版本
  startTime?: string;       // 开始时间
  endTime?: string;         // 结束时间
  searchText?: string;      // 搜索文本
  tags?: string[];          // 标签
  page?: number;           // 页码（默认：1）
  pageSize?: number;       // 每页大小（默认：20）
  sortBy?: string;         // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
}
```

#### 响应

```typescript
{
  success: boolean;
  data: {
    data: ErrorReport[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message: string;
}
```

### 3. 获取错误统计

```http
GET /error-monitoring/stats/:appId
```

获取指定应用的错误统计信息。

#### 查询参数

```typescript
{
  startTime?: string;  // 开始时间
  endTime?: string;    // 结束时间
}
```

#### 响应

```typescript
{
  success: boolean;
  data: {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    timeDistribution: Array<{
      time: string;
      count: number;
    }>;
    topErrors: Array<{
      message: string;
      category: ErrorCategory;
      severity: ErrorSeverity;
      count: number;
      lastOccurrence: number;
    }>;
  }
  message: string;
}
```

### 4. 获取错误详情

```http
GET /error-monitoring/details/:errorUid
```

获取指定错误的详细信息。

#### 响应

```typescript
{
  success: boolean;
  data?: ErrorReport;
  message: string;
}
```

### 5. 获取应用错误概览

```http
GET /error-monitoring/apps/:appId/summary
```

获取应用的错误概览信息。

#### 查询参数

```typescript
{
  period?: '24h' | '7d' | '30d';  // 时间范围（默认：24h）
}
```

#### 响应

```typescript
{
  success: boolean;
  data: {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    timeDistribution: Array<{
      time: string;
      count: number;
    }>;
    topErrors: Array<{
      message: string;
      category: ErrorCategory;
      severity: ErrorSeverity;
      count: number;
      lastOccurrence: number;
    }>;
    period: string;
    startTime: string;
    endTime: string;
  }
  message: string;
}
```

## 错误类型定义

### ErrorSeverity

```typescript
enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
```

### ErrorCategory

```typescript
enum ErrorCategory {
  RUNTIME = 'runtime',
  NETWORK = 'network',
  RESOURCE = 'resource',
  PROMISE = 'promise',
  SYNTAX = 'syntax',
  SECURITY = 'security',
  CUSTOM = 'custom',
}
```

## 使用示例

### 1. 上报错误

```typescript
const errorReport = {
  type: 'error',
  message: '无法加载资源',
  stack: 'Error: 无法加载资源\n    at load (/app.js:10:15)',
  timestamp: Date.now(),
  errorUid: 'unique-error-id',
  url: 'https://example.com/app',
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  appId: 'your-app-id',
  context: {
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.RESOURCE,
    environment: 'production',
    sessionId: 'user-session-id',
    userId: 'user-123',
    tags: {
      module: 'resource-loader',
      version: '1.0.0',
    },
  },
  mechanism: {
    type: 'resource',
    handled: false,
  },
  meta: {
    resourceUrl: 'https://example.com/style.css',
  },
};

await fetch('/error-monitoring/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(errorReport),
});
```

### 2. 查询错误

```typescript
const queryParams = new URLSearchParams({
  appId: 'your-app-id',
  severity: ErrorSeverity.HIGH,
  startTime: '2024-03-15T00:00:00Z',
  endTime: '2024-03-15T23:59:59Z',
  page: '1',
  pageSize: '20',
});

const response = await fetch(`/error-monitoring/query?${queryParams}`);
const result = await response.json();
```

### 3. 获取错误统计

```typescript
const appId = 'your-app-id';
const startTime = '2024-03-15T00:00:00Z';
const endTime = '2024-03-15T23:59:59Z';

const response = await fetch(
  `/error-monitoring/stats/${appId}?startTime=${startTime}&endTime=${endTime}`,
);
const result = await response.json();
```
