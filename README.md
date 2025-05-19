# TraceFlow

TraceFlow 是一个现代化的全链路埋点监控平台，帮助开发团队轻松实现前端监控、性能分析和用户行为追踪。

## 功能特性

- 🚀 **自动化埋点**：支持自动采集页面访问、点击事件、性能指标等数据
- 📊 **实时监控**：提供实时数据监控和分析面板
- 🔍 **性能分析**：包含页面加载性能、资源加载性能、API 请求性能等多维度分析
- 🎯 **用户行为**：支持用户行为路径分析、热图分析等
- 🔔 **异常监控**：自动捕获并报告 JS 错误、API 异常等问题
- 🧩 **插件系统**：高度可扩展的插件架构，支持自定义数据采集和处理逻辑
- 🔒 **沙箱隔离**：提供安全的代码执行环境，防止插件间相互干扰

## 技术栈

- **前端**：React + TypeScript + Vite
- **后端**：Node.js + NestJS + TypeScript
- **数据库**：MongoDB
- **消息队列**：Redis

## 系统架构

TraceFlow 采用模块化的微服务架构设计，主要包含以下组件：

```
├── SDK (客户端埋点)
│   ├── 核心模块
│   ├── 插件系统
│   ├── 沙箱隔离
│   └── 调度系统
│
├── 数据采集服务
│   ├── 实时数据接收
│   ├── 数据验证
│   └── 数据预处理
│
├── 数据处理服务
│   ├── 数据聚合
│   ├── 指标计算
│   └── 异常检测
│
└── 可视化平台
    ├── 实时监控
    ├── 报表分析
    └── 告警系统
```

## 项目结构

```
packages/
├── trace-sdk/        # 客户端埋点SDK，支持多平台接入
│   ├── src/          # 源代码
│   │   ├── constants/    # 常量定义
│   │   ├── core/         # 核心逻辑
│   │   ├── plugins/      # 插件系统
│   │   ├── sandbox/      # 沙箱隔离系统
│   │   ├── scheduler/    # 调度系统
│   │   ├── utils/        # 工具函数
│   │   └── index.ts      # SDK入口
│   ├── dist/         # 构建输出
│   └── test/         # 测试文件
│
├── trace-server/     # 后端服务，处理数据采集和分析
│   ├── src/          # 源代码
│   │   ├── modules/      # 服务模块
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 服务层
│   │   ├── models/       # 数据模型
│   │   └── utils/        # 工具函数
│   ├── dist/         # 构建输出
│   └── test/         # 测试文件
│
└── trace-admin/      # 可视化管理平台，数据展示和配置管理
    ├── src/          # 源代码
    │   ├── components/   # UI组件
    │   ├── pages/        # 页面
    │   ├── services/     # API服务
    │   ├── store/        # 状态管理
    │   └── utils/        # 工具函数
    ├── public/       # 静态资源
    └── dist/         # 构建输出
```

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8
- MongoDB >= 5
- Redis >= 6

### 本地开发环境

1. **克隆仓库**

```bash
git clone https://github.com/your-org/traceflow.git
cd traceflow
```

2. **安装依赖**

```bash
pnpm install
```

3. **启动开发服务**

```bash
# 启动所有项目
pnpm dev

# 启动单个项目
pnpm --filter trace-admin dev
pnpm --filter trace-server dev
```

4. **构建项目**

```bash
# 构建所有项目
pnpm build

# 构建单个项目
pnpm --filter trace-admin build
```

### SDK接入示例

```javascript
// 1. 安装SDK
// npm install @traceflow/sdk

// 2. 引入并初始化
import TraceSDK from '@traceflow/sdk';
import { errorTracking, performanceTracking, userBehavior } from '@traceflow/sdk/plugins';

const sdk = new TraceSDK({
  appId: 'your-app-id',
  reportUrl: 'https://your-backend/api/collect',
  plugins: [errorTracking(), performanceTracking(), userBehavior()],
});

// 3. 全局使用
window.traceSdk = sdk;

// 4. 手动上报自定义事件
sdk.trackEvent('user_signup', {
  userId: '12345',
  method: 'email',
});
```

## 核心模块

### SDK客户端

TraceFlow SDK是一个轻量级的前端监控SDK，通过灵活的插件系统支持多种监控场景：

- **核心（Core）**：提供基础功能和API
- **插件系统（Plugins）**：可扩展的插件架构
  - 错误监控插件
  - 性能监控插件
  - 用户行为插件
  - 网络请求插件
- **沙箱系统（Sandbox）**：安全隔离的代码执行环境
- **调度系统（Scheduler）**：任务调度和批处理

详细文档请参考[SDK文档](/packages/trace-sdk/README.md)。

### 后端服务

TraceFlow Server是基于NestJS构建的后端服务，负责数据采集、处理和存储：

- 高性能数据接收API
- 实时数据处理管道
- 数据聚合和分析服务
- 告警和通知系统

详细文档请参考[Server文档](/packages/trace-server/README.md)。

### 管理平台

TraceFlow Admin是一个功能丰富的监控管理平台：

- 实时监控仪表板
- 性能分析报表
- 用户行为分析
- 错误诊断和问题排查
- 自定义告警配置

## 代码规范

本项目使用 ESLint 和 Prettier 进行代码规范和格式化：

```bash
# 运行代码检查
pnpm lint

# 修复代码规范问题
pnpm lint:fix

# 格式化代码
pnpm format
```

## 贡献指南

欢迎提交 Issue 和 Pull Request。在提交 PR 之前，请确保：

1. 代码通过所有 ESLint 检查
2. 所有新功能都有相应的测试
3. 更新相关文档

## License

ISC License
