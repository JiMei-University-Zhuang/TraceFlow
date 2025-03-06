# 埋点事件 API 使用示例

## 启动服务器

```bash
# 进入 trace-server 目录
cd packages/trace-server

# 安装依赖
pnpm install

# 启动开发服务器
pnpm start:dev
```

服务器默认运行在 http://localhost:3000

## API 示例

### 获取埋点事件列表

#### 请求

```bash
curl http://localhost:3000/events?page=1&limit=10
```

#### 参数说明

- `page`: 页码，默认值为 1
- `limit`: 每页数量，默认值为 10

#### 响应

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0
  }
}
```

### 发送埋点事件

#### 请求

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "page_view",
    "timestamp": 1709632514000,
    "url": "https://example.com/home",
    "userId": "user123",
    "sessionId": "session456",
    "data": {
      "pageTitle": "首页",
      "referrer": "https://google.com",
      "screenResolution": "1920x1080"
    }
  }'
```

#### 响应

```json
{
  "success": true,
  "message": "Event received"
}
```

## 事件类型示例

以下是一些常见的事件类型示例：

1. 页面访问事件
```json
{
  "type": "page_view",
  "timestamp": 1709632514000,
  "url": "https://example.com/products",
  "userId": "user123",
  "sessionId": "session456",
  "data": {
    "pageTitle": "产品列表",
    "loadTime": 1200
  }
}
```

2. 点击事件
```json
{
  "type": "click",
  "timestamp": 1709632514000,
  "url": "https://example.com/products",
  "userId": "user123",
  "sessionId": "session456",
  "data": {
    "elementId": "buy-button",
    "elementText": "立即购买",
    "position": { "x": 150, "y": 300 }
  }
}
```

3. 性能事件
```json
{
  "type": "performance",
  "timestamp": 1709632514000,
  "url": "https://example.com/products",
  "userId": "user123",
  "sessionId": "session456",
  "data": {
    "fcp": 800,
    "lcp": 2100,
    "cls": 0.1,
    "fid": 100
  }
}
```

4. 错误事件
```json
{
  "type": "error",
  "timestamp": 1709632514000,
  "url": "https://example.com/products",
  "userId": "user123",
  "sessionId": "session456",
  "data": {
    "message": "Cannot read property 'x' of undefined",
    "stack": "TypeError: Cannot read property 'x' of undefined\n    at http://example.com/app.js:1:1",
    "filename": "app.js",
    "lineNumber": 1,
    "columnNumber": 1
  }
}
```

## 使用 Postman 测试

1. 打开 Postman
2. 创建新的 POST 请求
3. 设置请求 URL 为 `http://localhost:3000/events`
4. 设置 Content-Type header 为 `application/json`
5. 在请求体中填入上述示例中的任意一个事件数据
6. 点击发送并查看响应

## 注意事项

- timestamp 应该是一个 Unix 时间戳（毫秒）
- userId 和 sessionId 是可选的，但建议提供以便跟踪用户行为
- data 字段可以包含任意的额外信息，具体内容取决于事件类型
- 所有请求都应该使用 POST 方法
