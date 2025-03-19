# 性能监控接口测试文档

本文档演示如何使用性能监控相关的API接口

## 1. 保存性能指标

使用POST请求发送性能指标数据：

```bash
curl -X POST http://47.122.48.232:3000/performance/metrics \
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
curl "http://47.122.48.232:3000/performance/metrics?metricName=FCP"
```

预期响应：

```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "metricName": "FCP",
        "value": 1200,
        "timestamp": 1678271400000
      }
    ]
  },
  "message": "成功获取 FCP 的性能指标",
  "timestamp": 1678271400000
}
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
curl -X POST http://47.122.48.232:3000/performance/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "metricName": "LCP",
    "value": 2500,
    "timestamp": 1678271400000
  }'

# 发送CLS数据
curl -X POST http://47.122.48.232:3000/performance/metrics \
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
curl "http://47.122.48.232:3000/performance/metrics?metricName=LCP"

# 查询CLS数据
curl "http://47.122.48.232:3000/performance/metrics?metricName=CLS"
```

## 3. 按时间范围查询性能指标

使用GET请求查询指定时间范围内的性能指标。有两种方式指定时间范围：

### 3.1 使用相对时间

查询最近一小时的数据：

```bash
curl "http://47.122.48.232:3000/performance/metrics/timerange?range=1h"
```

查询最近一天的数据，并限制返回10条：

```bash
curl "http://47.122.48.232:3000/performance/metrics/timerange?range=1d&limit=10"
```

查询最近一周的数据：

```bash
curl "http://47.122.48.232:3000/performance/metrics/timerange?range=1w"
```

### 3.2 使用具体时间戳

查询指定时间范围的数据：

```bash
curl "http://47.122.48.232:3000/performance/metrics/timerange?startTime=1678271400000&endTime=1678271500000&limit=10"
```

参数说明：

- range: （可选）相对时间范围，支持的格式：
  - Nh: N小时内的数据，如 1h
  - Nd: N天内的数据，如 7d
  - Nw: N周内的数据，如 1w
- startTime: （可选）开始时间戳（毫秒）
- endTime: （可选）结束时间戳（毫秒）
- limit: （可选）返回的最大条数

注意：必须提供 range 或者 startTime + endTime 中的一种

预期响应：

```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "metricName": "FCP",
        "value": 1200,
        "timestamp": 1678271450000
      },
      {
        "metricName": "LCP",
        "value": 2500,
        "timestamp": 1678271420000
      }
    ]
  },
  "message": "成功获取时间范围内的性能指标",
  "timestamp": 1678271500000
}
```

注意：

1. 返回的数据按时间戳降序排序（最新的在前）
2. 目前数据是存储在内存中的，服务重启后数据会丢失。后续会添加数据库持久化功能。
