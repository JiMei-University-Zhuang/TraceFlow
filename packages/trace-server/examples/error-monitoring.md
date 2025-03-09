# 错误监控模块

## 功能概述

错误监控模块用于收集、存储和分析应用程序运行时的错误信息。通过这个模块，我们可以及时发现和处理应用程序中出现的问题。

## 接口说明

### 1. 错误报告提交

- **接口**: `POST /error-monitoring/report`
- **功能**: 接收并保存错误报告
- **请求体格式**:
  ```json
  {
    "message": "页面加载失败",
    "type": "Error",
    "stack": "Error: 页面加载失败\n    at loadPage (/src/pages/index.tsx:25:7)",
    "userAgent": "Mozilla/5.0 (Macintosh)",
    "timestamp": 1709989200000,
    "userId": "user123",
    "environment": "production"
  }
  ```
- **响应格式**:
  ```json
  {
    "success": true,
    "message": "错误报告保存成功",
    "data": {
      "errorId": 1
    }
  }
  ```

### 2. 错误查询

- **接口**: `GET /error-monitoring/query`
- **功能**: 分页查询错误报告，支持多种过滤条件
- **请求参数**:
  ```typescript
  {
    startTime?: number;    // 开始时间戳
    endTime?: number;      // 结束时间戳
    type?: ErrorType;      // 错误类型
    userId?: string;       // 用户ID
    page?: number;         // 页码，默认1
    pageSize?: number;     // 每页数量，默认20
  }
  ```
- **响应格式**:
  ```json
  {
    "items": [ErrorReportDto],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
  ```

### 3. 错误统计

- **接口**: `GET /error-monitoring/stats`
- **功能**: 获取错误统计信息
- **响应格式**:
  ```json
  {
    "totalErrors": 100,
    "errorsByType": {
      "Error": 50,
      "Warning": 30,
      "Info": 20
    },
    "uniqueUsers": 45
  }
  ```

## 使用示例

### 1. 发送错误报告

```typescript
const errorReport = {
  message: '页面加载失败',
  type: 'Error',
  stack: 'Error: 页面加载失败\n    at loadPage (/src/pages/index.tsx:25:7)',
  userAgent: 'Mozilla/5.0 (Macintosh)',
  timestamp: Date.now(),
  userId: 'user123',
  environment: 'production',
};

const response = await fetch('http://your-api-host/error-monitoring/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(errorReport),
});

const result = await response.json();
console.log('错误报告ID:', result.data.errorId);
```

### 2. 查询错误报告

```typescript
// 查询过去24小时内的Error类型错误
const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
const queryParams = new URLSearchParams({
  startTime: oneDayAgo.toString(),
  type: 'Error',
  page: '1',
  pageSize: '20',
});

const response = await fetch(
  `http://your-api-host/error-monitoring/query?${queryParams}`,
);
const result = await response.json();

console.log('总错误数:', result.total);
console.log('当前页错误:', result.items);
```

### 3. 获取错误统计

```typescript
// 获取错误统计信息
const response = await fetch('http://your-api-host/error-monitoring/stats');
const stats = await response.json();

console.log('总错误数:', stats.totalErrors);
console.log('各类型错误数:', stats.errorsByType);
console.log('受影响用户数:', stats.uniqueUsers);
```

```

## 后续开发计划

1. 数据持久化

   - [ ] 添加数据库存储支持
   - [ ] 实现错误数据的定期清理

2. 错误查询功能

   - [x] 添加按时间范围查询接口
   - [x] 添加按错误类型查询接口
   - [x] 支持分页查询

3. 统计分析功能

   - [x] 错误频率统计（总错误数）
   - [x] 错误类型分布
   - [x] 影响用户数统计

4. 告警机制
   - [ ] 配置告警规则
   - [ ] 支持多种告警方式（邮件、webhook等）
   - [ ] 告警级别管理

## 注意事项

1. 错误报告中的敏感信息处理

   - 确保不收集用户的敏感个人信息
   - 对错误堆栈信息进行脱敏处理

2. 性能考虑

   - 大量错误报告时的处理策略
   - 数据存储的优化方案

3. 安全性
   - 接口访问权限控制
   - 数据加密传输
```
