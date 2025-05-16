# 通用上报接口文档

TraceFlow 服务器提供了一系列用于接收前端监控数据的上报接口，包括单个事件上报和批量上报。本文档详细介绍这些接口的使用方法、请求格式和响应结构。

## 目录

- [单个事件上报](#单个事件上报)
- [批量事件上报](#批量事件上报)
- [性能指标上报](#性能指标上报)
- [常见问题](#常见问题)

## 单个事件上报

### 接口描述

用于上报单个事件数据，包括用户行为、错误信息等。

### 请求方式

- **URL**: `/events`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数

| 参数名    | 类型   | 必填 | 描述                                      |
| --------- | ------ | ---- | ----------------------------------------- |
| eventType | String | 是   | 事件类型，如 `behavior_click`、`error` 等 |
| timestamp | Number | 是   | 事件发生的时间戳（毫秒）                  |
| pageUrl   | String | 是   | 事件发生的页面URL                         |
| eventData | Object | 是   | 事件详细数据，根据事件类型不同而变化      |

### 示例请求

```json
{
  "eventType": "behavior_click",
  "timestamp": 1678271400000,
  "pageUrl": "https://example.com/products",
  "eventData": {
    "element": "button",
    "content": "立即购买",
    "selector": "#buy-now-btn"
  }
}
```

### 响应参数

| 参数名    | 类型    | 描述                    |
| --------- | ------- | ----------------------- |
| success   | Boolean | 请求是否成功            |
| message   | String  | 响应消息                |
| timestamp | String  | 服务器处理时间(ISO格式) |
| event     | Object  | 原始事件数据            |

### 示例响应

```json
{
  "success": true,
  "message": "Event received successfully",
  "timestamp": "2023-03-08T12:36:40.000Z",
  "event": {
    "eventType": "behavior_click",
    "timestamp": 1678271400000,
    "pageUrl": "https://example.com/products",
    "eventData": {
      "element": "button",
      "content": "立即购买",
      "selector": "#buy-now-btn"
    }
  }
}
```

## 批量事件上报

### 接口描述

用于一次性上报多个事件数据，提高网络效率。

### 请求方式

- **URL**: `/events/batch`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数

请求体为事件对象数组，每个事件对象结构与单个事件上报相同。

### 示例请求

```json
[
  {
    "eventType": "performance",
    "timestamp": 1678271400000,
    "pageUrl": "https://example.com/home",
    "eventData": {
      "LCP": 2500,
      "FCP": 1200,
      "CLS": 0.1,
      "TTFB": 800
    }
  },
  {
    "eventType": "behavior_click",
    "timestamp": 1678271410000,
    "pageUrl": "https://example.com/home",
    "eventData": {
      "element": "button",
      "content": "登录",
      "selector": "#login-btn"
    }
  },
  {
    "eventType": "error",
    "timestamp": 1678271420000,
    "pageUrl": "https://example.com/home",
    "eventData": {
      "message": "Uncaught TypeError: Cannot read property 'value' of null",
      "stack": "TypeError: Cannot read property 'value' of null\n    at processForm (app.js:120)\n    at submitForm (app.js:45)",
      "type": "js_error"
    }
  }
]
```

### 响应参数

| 参数名  | 类型    | 描述             |
| ------- | ------- | ---------------- |
| success | Boolean | 请求是否成功     |
| data    | Object  | 处理结果统计信息 |
| message | String  | 响应消息         |

### 数据结构 (data)

| 参数名    | 类型   | 描述                     |
| --------- | ------ | ------------------------ |
| total     | Number | 总事件数                 |
| processed | Number | 成功处理的事件数         |
| byType    | Object | 按事件类型统计的处理结果 |

### 示例响应

```json
{
  "success": true,
  "data": {
    "total": 3,
    "processed": 1,
    "byType": {
      "performance": 1,
      "behavior_click": 1,
      "error": 1
    }
  },
  "message": "批量事件处理完成"
}
```

## 性能指标上报

### 接口描述

专门用于上报单个性能指标数据。

### 请求方式

- **URL**: `/performance/metrics`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数

| 参数名     | 类型   | 必填 | 描述                         |
| ---------- | ------ | ---- | ---------------------------- |
| metricName | String | 是   | 指标名称，如 `LCP`、`FCP` 等 |
| value      | Number | 是   | 指标值                       |
| timestamp  | Number | 是   | 指标收集时间戳（毫秒）       |

### 示例请求

```json
{
  "metricName": "FCP",
  "value": 1200,
  "timestamp": 1678271400000
}
```

### 响应参数

| 参数名  | 类型    | 描述         |
| ------- | ------- | ------------ |
| success | Boolean | 请求是否成功 |
| data    | Object  | 保存的指标   |
| message | String  | 响应消息     |

### 示例响应

```json
{
  "success": true,
  "data": {
    "metricName": "FCP",
    "value": 1200,
    "timestamp": 1678271400000
  },
  "message": "性能指标保存成功"
}
```

## 常见问题

### 上报时机选择

- **性能指标**：建议在页面加载完成后收集并上报核心性能指标
- **用户行为**：可以实时上报或批量收集后定期上报
- **错误信息**：建议即时上报，确保及时发现问题

### 批量上报 vs 单个上报

- 批量上报可以减少网络请求次数，适合非关键数据
- 对于重要错误或需要立即处理的事件，推荐使用单个上报
- 批量上报建议设置合理的触发条件：
  - 达到一定数量的事件（如 10-20 个）
  - 达到一定的时间间隔（如 5-10 秒）
  - 页面即将卸载时

### 数据大小限制

为保证服务器处理效率，单次批量上报的数据量建议不超过 100KB。如果数据量较大，建议分批发送。

### 上报失败处理

客户端应实现以下策略来处理上报失败：

1. 重试机制：网络错误时自动重试，建议设置最大重试次数
2. 本地存储：临时将失败的事件存储在 localStorage 中
3. 优先级策略：确保重要事件（如错误）优先发送

### CURL 测试示例

#### 单个性能指标上报

```bash
curl -X POST http://localhost:3000/performance/metrics \
  -H "Content-Type: application/json" \
  -d '{"metricName": "FCP", "value": 1200, "timestamp": 1678271400000}'
```

#### 批量事件上报

```bash
curl -X POST http://localhost:3000/events/batch \
  -H "Content-Type: application/json" \
  -d '[{"eventType": "performance", "timestamp": 1678271400000, "pageUrl": "http://example.com/test", "eventData": {"FCP": 1200, "LCP": 2500}}]'
```
