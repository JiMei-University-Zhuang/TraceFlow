# TraceFlow Server

TraceFlow服务端是一个基于NestJS构建的高性能后端系统，用于接收、处理、存储和分析来自前端SDK的监控数据。

## 功能特性

- **高性能数据接收**：优化的API端点，支持高并发数据采集
- **实时数据处理**：流式处理管道，高效处理大量监控事件
- **数据聚合分析**：多维度指标计算和异常检测
- **可扩展架构**：模块化设计，易于扩展新功能
- **告警系统**：基于规则的实时告警机制
- **多种存储支持**：支持MongoDB、MySQL、PostgreSQL等多种数据库
- **身份认证**：JWT认证和细粒度的访问控制

## 技术栈

- [NestJS](https://nestjs.com/) - 企业级Node.js框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的JavaScript超集
- [MongoDB](https://www.mongodb.com/) - 主数据存储
- [Redis](https://redis.io/) - 缓存和消息队列
- [Bull](https://github.com/OptimalBits/bull) - 任务队列处理
- [Mongoose](https://mongoosejs.com/) - MongoDB对象建模
- [Passport](https://www.passportjs.org/) - 身份验证
- [Jest](https://jestjs.io/) - 测试框架

## 系统架构

TraceFlow服务端采用模块化的微服务架构：

```
├── 接入层 (API Gateway)
│   ├── 数据接收服务
│   ├── 身份认证
│   └── 速率限制
│
├── 数据处理层 (Processing Layer)
│   ├── 数据验证
│   ├── 数据分组
│   ├── 数据转换
│   └── 数据过滤
│
├── 业务层 (Business Layer)
│   ├── 错误分析服务
│   ├── 性能分析服务
│   ├── 用户行为分析
│   └── 告警服务
│
└── 存储层 (Storage Layer)
    ├── 时序数据
    ├── 结构化数据
    ├── 统计数据
    └── 报表数据
```

## 项目结构

```
packages/trace-server/
├── src/
│   ├── config/                # 配置文件
│   ├── modules/               # 业务模块
│   │   ├── auth/              # 认证模块
│   │   ├── collect/           # 数据采集模块
│   │   ├── error/             # 错误分析模块
│   │   ├── performance/       # 性能分析模块
│   │   ├── user-behavior/     # 用户行为模块
│   │   └── alert/             # 告警模块
│   ├── shared/                # 共享资源
│   │   ├── decorators/        # 自定义装饰器
│   │   ├── filters/           # 异常过滤器
│   │   ├── guards/            # 守卫
│   │   ├── interceptors/      # 拦截器
│   │   ├── interfaces/        # 接口定义
│   │   ├── middlewares/       # 中间件
│   │   └── pipes/             # 管道
│   ├── utils/                 # 工具函数
│   ├── app.module.ts          # 应用主模块
│   ├── app.controller.ts      # 应用控制器
│   ├── app.service.ts         # 应用服务
│   └── main.ts                # 应用入口
├── test/                      # 测试文件
│   ├── unit/                  # 单元测试
│   └── integration/           # 集成测试
├── dist/                      # 构建输出
└── config/                    # 环境配置
```

## 快速开始

### 环境要求

- Node.js >= 16
- MongoDB >= 5
- Redis >= 6

### 本地开发

1. **安装依赖**

```bash
pnpm install
```

2. **配置环境变量**

创建`.env`文件，参考`.env.example`：

```
# 应用配置
PORT=3000
NODE_ENV=development
APP_NAME=traceflow-server

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/traceflow
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=yoursecretkey
JWT_EXPIRATION=86400
```

3. **启动开发服务器**

```bash
pnpm start:dev
```

4. **构建生产版本**

```bash
pnpm build
```

## API接口

### 数据采集API

```bash
# 接收SDK上报的数据
POST /api/collect

# 接收批量上报的数据
POST /api/collect/batch
```

### 错误分析API

```bash
# 获取错误列表
GET /api/errors

# 获取错误详情
GET /api/errors/:id

# 获取错误统计
GET /api/errors/stats
```

### 性能分析API

```bash
# 获取性能指标
GET /api/performance

# 获取Web Vitals数据
GET /api/performance/web-vitals

# 获取资源加载性能
GET /api/performance/resources
```

### 用户行为API

```bash
# 获取用户会话
GET /api/sessions

# 获取用户行为路径
GET /api/user-behavior/paths

# 获取页面访问热图
GET /api/user-behavior/heatmap
```

## 数据模型

### Error模型

```typescript
interface ErrorEntity {
  id: string;
  appId: string;
  message: string;
  stack: string;
  type: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}
```

### Performance模型

```typescript
interface PerformanceEntity {
  id: string;
  appId: string;
  metrics: {
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    ttfb: number; // Time to First Byte
    domLoad: number; // DOMContentLoaded
    load: number; // Load
  };
  resources?: ResourceTiming[];
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
}
```

### 用户会话模型

```typescript
interface SessionEntity {
  id: string;
  appId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  events: EventEntity[];
  pages: PageVisitEntity[];
  metadata?: Record<string, any>;
}
```

## 配置与扩展

### 数据采样配置

通过环境变量或配置文件调整数据采样率：

```typescript
// config/app.config.ts
export default {
  sampling: {
    errors: 1.0, // 100% 错误数据
    performance: 0.5, // 50% 性能数据
    userBehavior: 0.1, // 10% 用户行为数据
  },
};
```

### 添加新的数据处理管道

创建自定义数据处理器：

```typescript
// src/modules/collect/processors/custom-processor.service.ts
@Injectable()
export class CustomProcessor implements DataProcessor {
  process(data: CollectDto): ProcessedData {
    // 自定义处理逻辑
    return transformedData;
  }
}
```

注册到处理管道：

```typescript
// src/modules/collect/collect.module.ts
@Module({
  providers: [
    // 其他处理器
    CustomProcessor,
    {
      provide: 'DataProcessors',
      useFactory: (
        validationProcessor: ValidationProcessor,
        customProcessor: CustomProcessor,
        // 其他处理器
      ) => [
        validationProcessor,
        customProcessor,
        // 其他处理器
      ],
      inject: [ValidationProcessor, CustomProcessor /* 其他处理器 */],
    },
  ],
})
export class CollectModule {}
```

## 设计原则

TraceFlow Server遵循以下设计原则：

1. **可伸缩性**：支持水平扩展，处理大规模数据
2. **可靠性**：容错设计，确保数据不丢失
3. **可维护性**：模块化和测试驱动开发
4. **安全性**：数据验证、身份认证和加密
5. **性能优化**：高效的数据处理和存储

## 贡献指南

欢迎提交 Issue 和 Pull Request。在提交 PR 之前，请确保：

1. 代码通过所有测试
2. 遵循项目的代码风格
3. 适当添加单元测试和文档

## License

ISC License
