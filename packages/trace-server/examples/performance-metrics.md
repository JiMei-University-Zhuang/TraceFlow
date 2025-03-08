# 性能监控接口测试文档

本文档演示如何使用性能监控相关的API接口

## 1. 保存性能指标

使用POST请求发送性能指标数据：

```bash
curl -X POST http://localhost:3000/performance/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "metricName": "FCP",
    "value": 1200,
    "timestamp": 1678271400000
  }'
```

预期响应：

```json
{
  "metricName": "FCP",
  "value": 1200,
  "timestamp": 1678271400000
}
```

## 2. 查询性能指标

使用GET请求查询特定名称的性能指标：

```bash
curl "http://localhost:3000/performance/metrics?metricName=FCP"
```

预期响应：

```json
[
  {
    "metricName": "FCP",
    "value": 1200,
    "timestamp": 1678271400000
  }
]
```

## 测试步骤

1. 首先确保服务器已经启动：

```bash
npm run start:dev
```

2. 使用上述curl命令或者Postman等工具发送请求测试接口

3. 可以多次发送不同的性能指标数据，比如：

```bash
# 发送LCP数据
curl -X POST http://localhost:3000/performance/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "metricName": "LCP",
    "value": 2500,
    "timestamp": 1678271400000
  }'

# 发送CLS数据
curl -X POST http://localhost:3000/performance/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "metricName": "CLS",
    "value": 0.1,
    "timestamp": 1678271400000
  }'
```

4. 然后可以分别查询不同类型的性能指标：

```bash
# 查询LCP数据
curl "http://localhost:3000/performance/metrics?metricName=LCP"

# 查询CLS数据
curl "http://localhost:3000/performance/metrics?metricName=CLS"
```

注意：目前数据是存储在内存中的，服务重启后数据会丢失。后续会添加数据库持久化功能。
