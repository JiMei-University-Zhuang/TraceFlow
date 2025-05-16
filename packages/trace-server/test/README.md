# 批量事件处理测试指南

本文档提供了测试通用批量事件处理接口 `/events/batch` 的不同方法。

## 测试方法

有三种方式可以测试批量事件处理功能：

1. **自动化单元测试** - 使用Jest测试框架
2. **NodeJS命令行测试** - 使用Node脚本模拟SDK请求
3. **浏览器交互测试** - 使用HTML页面直观地测试

## 前提条件

确保已启动服务器：

```bash
# 在开发模式下启动服务器
cd packages/trace-server
npm run start:dev
```

## 1. 自动化单元测试

运行Jest测试：

```bash
cd packages/trace-server
npm test -- events-batch.spec.ts
```

此测试会验证批量事件处理接口是否能正确处理性能事件，并模拟了PerformanceService以检查事件处理过程。

## 2. NodeJS命令行测试

使用Node脚本发送测试请求：

```bash
cd packages/trace-server/test
node events-batch-client.js
```

脚本会向服务器发送包含各种类型事件的批量请求，并在控制台输出结果和统计信息。

## 3. 浏览器交互测试

1. 在浏览器中打开HTML测试页面：

   ```
   file:///path/to/packages/trace-server/test/events-batch-browser.html
   ```

   或者使用HTTP服务器托管此页面：

   ```bash
   cd packages/trace-server/test
   npx http-server
   ```

   然后访问 http://localhost:8080/events-batch-browser.html

2. 页面提供三个测试按钮：

   - **测试性能事件** - 发送纯性能指标数据
   - **测试混合事件** - 发送包含性能、行为和错误的混合数据
   - **模拟SDK批量上报** - 生成随机事件数据模拟真实场景

3. 点击任意按钮发送请求并查看响应结果

## 预期结果

成功处理请求后，服务器应返回：

```json
{
  "success": true,
  "data": {
    "total": 4,
    "processed": 2,
    "byType": {
      "performance": 2
    }
  },
  "message": "成功处理 2/4 条事件数据",
  "timestamp": 1634567890123
}
```

- `total`: 请求中的总事件数
- `processed`: 成功处理的事件数
- `byType`: 按事件类型分组的处理统计

## 问题排查

如果遇到问题：

1. 确保服务器在运行中 (http://localhost:3000)
2. 检查服务器日志输出
3. 确认 `EventsController` 已正确配置并注入 `PerformanceService`
4. 验证模块间的循环依赖设置正确
5. 检查CORS配置（如果从不同域名测试）

## 扩展测试其他事件类型

当前实现只处理 `performance` 类型的事件。要处理其他类型的事件：

1. 在 `EventsController` 中取消注释相应的处理代码
2. 实现相应的 `processErrorEvent` 或 `processBehaviorEvent` 方法
3. 确保相关服务已正确注入
