# TraceFlow SDK

一个全面的前端全链路监控SDK，用于捕获错误、性能指标和用户行为。

## 功能特性

- **错误监控**：自动捕获JavaScript错误、Promise拒绝、资源加载错误和HTTP请求失败
- **性能监控**：跟踪Web Vitals、页面加载时间、资源加载和API性能
- **用户行为跟踪**：记录用户交互、页面导航和会话信息
- **灵活配置**：可自定义过滤、采样和报告选项
- **实时和批量报告**：立即发送关键问题，同时批量处理非关键数据
- **插件系统**：支持通过插件扩展功能，自定义数据采集和处理逻辑
- **沙箱隔离**：提供安全的代码执行环境，防止插件间相互干扰

## 安装

```bash
npm install @traceflow/sdk
```

## 基本用法

```javascript
import TraceSDK from '@traceflow/sdk';

const sdk = new TraceSDK({
  appId: 'your-app-id',
  reportUrl: 'https://your-backend-endpoint/report',
  environment: 'production',
  tags: {
    version: '1.0.0',
    team: 'frontend',
  },
});
```

## 高级配置

```javascript
import TraceSDK from '@traceflow/sdk';

const sdk = new TraceSDK({
  appId: 'your-app-id',
  reportUrl: 'https://your-backend-endpoint/report',
  errorFilter: error => {
    // 过滤特定错误
    return !error.message.includes('ResizeObserver');
  },
  environment: 'production',
  release: 'v1.1.0',
  tags: {
    version: '1.0.0',
    team: 'frontend',
  },
  plugins: [
    errorTracking(),
    performanceTracking({
      webVitals: true,
      resources: true,
      timing: true,
    }),
    userBehavior(),
  ],
});

// 初始化Axios监控
const http = sdk.initAxios();
```

## HTTP监控

SDK可以通过原生XMLHttpRequest/fetch或Axios自动监控HTTP请求：

```javascript
// 对于Axios
const http = sdk.initAxios();

// 使用返回的实例进行API调用
http
  .get('/api/users')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

## 手动事件跟踪

您可以手动跟踪特定事件：

```javascript
import { Tracker } from '@traceflow/sdk';

const tracker = new Tracker({
  endpoint: 'https://your-backend-endpoint/report',
  autoTrack: {
    pageView: true,
    click: true,
    performance: true,
  },
});

// 跟踪自定义事件
tracker.trackEvent('custom_event', true, {
  action: 'button_click',
  label: 'submit_form',
  value: 1,
});

// 报告性能指标
tracker.reportPerformance({
  customMetric: 250,
  operation: 'data_processing',
});

// 报告用户行为
tracker.reportBehavior('user_action', {
  action: 'toggle_setting',
  target: 'dark_mode',
  value: true,
});

// 报告错误
tracker.reportError(new Error('Something went wrong'), {
  component: 'PaymentForm',
  userId: '12345',
});
```

## 插件系统

TraceFlow SDK采用了插件化架构，您可以自定义插件或使用内置插件：

```javascript
import TraceSDK, { createPlugin } from '@traceflow/sdk';
import { errorTracking, performanceTracking } from '@traceflow/sdk/plugins';

// 创建自定义插件
const myCustomPlugin = createPlugin({
  name: 'custom-tracking',
  setup(context, options) {
    // 插件初始化逻辑
    return {
      // 插件导出的方法
      trackCustomMetric(name, value) {
        context.report('custom', { name, value });
      },
    };
  },
});

// 使用插件
const sdk = new TraceSDK({
  appId: 'your-app-id',
  reportUrl: 'https://your-endpoint/report',
  plugins: [errorTracking(), performanceTracking(), myCustomPlugin({ threshold: 100 })],
});

// 访问自定义插件的方法
sdk.plugins.getPlugin('custom-tracking').trackCustomMetric('render-time', 125);
```

## 沙箱系统

SDK提供了沙箱隔离机制，保证插件之间的安全执行和独立环境：

```javascript
import { ProxySandbox } from '@traceflow/sdk/sandbox';

// 创建沙箱实例
const sandbox = new ProxySandbox({
  denyList: ['document.cookie', 'localStorage'],
});

// 在沙箱环境中执行代码
sandbox.execScript(`
  // 这里的代码将在隔离环境中执行
  const data = { count: 0 };
  function increment() {
    data.count++;
    return data.count;
  }
  increment();
`);

// 获取沙箱上下文
const context = sandbox.getContext();
console.log(context.data.count); // 1

// 重置沙箱
sandbox.reset();

// 销毁沙箱
sandbox.destroy();
```

## 项目架构

TraceFlow SDK采用模块化架构设计，主要包含以下核心模块：

```
packages/trace-sdk/
├── src/
│   ├── constants/      # 常量定义
│   ├── core/           # 核心逻辑
│   │   └── index.ts    # 核心导出
│   ├── plugins/        # 插件系统
│   │   ├── system/     # 插件框架
│   │   ├── error/      # 错误监控插件
│   │   ├── performance/# 性能监控插件
│   │   └── event/      # 事件监控插件
│   ├── sandbox/        # 沙箱隔离系统
│   │   ├── types.ts    # 沙箱类型定义
│   │   ├── AbstractSandbox.ts # 抽象沙箱基类
│   │   └── ProxySandbox.ts    # 基于Proxy的沙箱实现
│   ├── scheduler/      # 调度系统
│   │   └── index.ts    # 任务调度器
│   ├── utils/          # 工具函数
│   │   ├── browser.ts  # 浏览器相关
│   │   ├── logger.ts   # 日志工具
│   │   └── network.ts  # 网络相关
│   └── index.ts        # SDK入口
└── package.json
```

## License

ISC
