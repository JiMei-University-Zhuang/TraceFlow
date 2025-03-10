# TraceFlow

TraceFlow 是一个现代化的全链路埋点监控平台，帮助开发团队轻松实现前端监控、性能分析和用户行为追踪。

## 功能特性

- 🚀 自动化埋点：支持自动采集页面访问、点击事件、性能指标等数据
- 📊 实时监控：提供实时数据监控和分析面板
- 🔍 性能分析：包含页面加载性能、资源加载性能、API 请求性能等多维度分析
- 🎯 用户行为：支持用户行为路径分析、热图分析等
- 🔔 异常监控：自动捕获并报告 JS 错误、API 异常等问题

## 技术栈

- 前端：React + TypeScript + Vite
- 后端：Node.js + NestJS + TypeScript
- 数据库：MongoDB
- 消息队列：Redis

## 项目结构

```
packages/
├── trace-sdk/      # 客户端埋点SDK，支持多平台接入
├── trace-server/   # 后端服务，处理数据采集和分析
└── trace-admin/    # 可视化管理平台，数据展示和配置管理
```

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动所有项目
pnpm dev

# 启动单个项目
pnpm --filter trace-admin dev
pnpm --filter trace-server dev
```

### 构建

```bash
# 构建所有项目
pnpm build

# 构建单个项目
pnpm --filter trace-admin build
```

### 代码规范

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
