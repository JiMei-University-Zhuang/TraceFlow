# TraceFlow Node Server

这是TraceFlow的Express后端实现版本，提供更轻量级和易于理解的架构。

## 项目结构

```
trace-nodeServer/
├── src/
│   ├── controllers/     # 控制器层，处理业务逻辑
│   ├── models/          # 数据模型层，定义数据结构
│   ├── services/        # 服务层，封装复杂业务逻辑
│   ├── middlewares/     # 中间件，如权限验证等
│   ├── routes/          # 路由定义
│   ├── utils/           # 工具函数
│   ├── config/          # 配置文件
│   └── app.js           # 应用入口
├── public/              # 静态资源
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
└── package.json         # 项目依赖
```

## 功能特性

- 🚀 埋点数据收集API
- 📊 数据统计分析
- 🔒 用户认证与授权
- 📝 日志记录
- 🔄 数据库集成

## 快速开始

### 环境要求

- Node.js >= 16
- MySQL >= 5.7

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑.env文件，配置数据库等信息
vim .env
```

### 运行开发服务器

```bash
pnpm dev
```

服务将在 http://localhost:3001 运行。

### 构建生产版本

```bash
pnpm build
```

### 运行生产服务器

```bash
pnpm start
```

## API文档

### 数据采集接口

- POST /api/collect - 收集埋点数据
  - 请求体: { eventType, eventName, userId, ... }
  - 响应: { success, message, eventId }

### 数据分析接口

- GET /api/analytics/events - 获取事件统计
  - 查询参数: startDate, endDate, eventType
  - 响应: { totalEvents, eventsByType }

## 与NestJS版本的区别

本Express版本相对于NestJS版本更加轻量，主要区别：

1. **更扁平的项目结构**：没有模块概念，通过文件夹组织代码
2. **更直接的中间件使用**：直接使用Express中间件，无需适配器
3. **更低的学习成本**：Express的API和概念更加简单明了
4. **更灵活的实现方式**：没有强制的架构模式，自由度更高

## 技术栈

- Express 4.18
- Sequelize 6.35
- MySQL
- Winston (日志)
