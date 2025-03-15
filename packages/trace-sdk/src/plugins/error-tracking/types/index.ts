import { behaviorStack } from '../../../core/types';

export * from './error';

// 用户实例接口
export interface UserInstance {
  breadcrumbs: {
    get: () => Breadcrumb[];
    clear: () => void;
    add: (_crumb: Breadcrumb) => void;
    set: (_key: string, _value: Breadcrumb) => void;
    remove: (_key: string) => void;
  };
  metrics: {
    get: (_key: string) => unknown;
    set: (_key: string, _value: unknown) => void;
  };
}

// 传输实例接口
export interface TransportInstance {
  kernelTransportHandler: (data: unknown) => void;
  formatTransportData: (category: string, data: unknown) => unknown;
}

// 错误监控引擎实例配置
export interface EngineConfig {
  // 基础配置
  transportCategory: string; // 传输类别，用于区分不同类型的数据
  userInstance: UserInstance; // 用户实例，用于管理用户行为和页面信息
  transportInstance: TransportInstance; // 传输实例，用于处理数据上报
  reportUrl?: string; // 错误上报的目标 URL

  // 错误队列配置
  queueSize?: number; // 待上报队列的大小限制
  persistQueueSize?: number; // 持久化队列的大小限制
  queueOverflowAction?: 'drop-oldest' | 'drop-newest'; // 队列溢出时的处理策略

  // 批量上报配置
  batchReport?: boolean; // 是否启用批量上报
  batchSize?: number; // 批量上报的数量阈值
  batchTimeout?: number; // 批量上报的超时时间（毫秒）

  // 错误过滤
  errorFilter?: (error: unknown) => boolean; // 错误过滤函数，返回 true 表示需要上报
}

// HTTP请求指标
export interface ErrorMetrics {
  message: string;
  stack?: string;
  lineno?: number;
  colno?: number;
  filename?: string;
  error?: Error;
  type?: string;
  timeStamp: number;
  data?: Record<string, unknown>;
}

export interface HttpMetrics {
  method: string;
  url: string;
  body?: unknown;
  status?: number;
  statusText?: string;
  response?: string | unknown;
  requestTime: number;
  responseTime?: number;
  data?: Record<string, unknown>;
}

export interface EventHandler {
  (event: ErrorMetrics | HttpMetrics): void;
}

// 错误机制类型
export const mechanismType = {
  JS: 'js' as const, // JavaScript 错误
  PROMISE: 'promise' as const, // Promise 错误
  RESOURCE: 'resource' as const, // 资源加载错误
  HTTP: 'http' as const, // HTTP 请求错误
  CUSTOM: 'custom' as const, // 自定义错误
  RS: 'resource' as const, // 资源错误（兼容性别名）
  CS: 'cross-script' as const, // 跨域脚本错误
} as const;

// 错误机制类型的类型定义
export type MechanismType = (typeof mechanismType)[keyof typeof mechanismType];

// 错误事件类型
export const errorEventTypes = {
  JS_ERROR: 'js_error',
  RESOURCE_ERROR: 'resource_error',
  PROMISE_ERROR: 'promise_error',
  HTTP_ERROR: 'http_error',
  CUSTOM_ERROR: 'custom_error',
  CUSTOM_EVENT: 'custom_event',
  UNKNOWN: 'unknown',
} as const;

export type ErrorEventType = (typeof errorEventTypes)[keyof typeof errorEventTypes];

// 错误事件数据结构
export interface ExceptionMetrics {
  // 基础错误信息
  type: ErrorEventType;
  message: string;
  stack?: string;
  timestamp: number;
  errorUid: string;

  // 错误上下文
  url: string;
  userAgent: string;
  platform: string;
  browserInfo?: {
    name: string;
    version: string;
  };

  // 错误机制
  mechanism: {
    type: MechanismType;
    handled?: boolean;
    data?: Record<string, unknown>;
  };

  // 错误分类和严重程度
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;

  // 采样信息
  sampling?: {
    rate: number;
    isSelected: boolean;
  };

  // 用户行为跟踪
  breadcrumbs?: Array<behaviorStack>;
  pageInformation?: unknown;

  // 扩展信息
  meta: Record<string, unknown>;
}

// 错误上报数据结构
export interface ErrorReport {
  // 基础信息
  appId: string;
  version: string;
  environment: 'development' | 'testing' | 'production';
  timestamp: number;

  // 错误信息
  errors: ExceptionMetrics[];
  batchId?: string; // 批量上报的ID

  // 统计信息
  stats?: {
    totalErrors: number;
    uniqueErrors: number;
    affectedUsers: number;
    errorsByType: Record<ErrorEventType, number>;
    errorsBySeverity: Record<string, number>;
  };

  // 扩展信息
  metadata?: {
    url: string;
    userAgent: string;
    timestamp: number;
    sessionId?: string;
    userId?: string;
    [key: string]: unknown;
  };
}

// 错误堆栈帧类型
export interface StackFrame {
  filename?: string;
  function?: string;
  lineno?: number;
  colno?: number;
}

// 传输类别枚举
export enum transportCategory {
  ERROR = 'error',
  PERFORMANCE = 'performance',
  BEHAVIOR = 'behavior',
  USER = 'user',
}

// 面包屑类型
export type Breadcrumb = {
  message: string;
  data?: Record<string, unknown>;
};

// 用户类型
export type User = {
  id?: string;
  username?: string;
  email?: string;
};

// 错误处理函数类型
export type ErrorHandler = (error: unknown) => void;

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 错误分类
export enum ErrorCategory {
  RUNTIME = 'runtime',
  NETWORK = 'network',
  RESOURCE = 'resource',
  PROMISE = 'promise',
  SYNTAX = 'syntax',
  SECURITY = 'security',
  CUSTOM = 'custom',
}

// 错误上下文
export interface ErrorContext {
  severity: ErrorSeverity;
  category: ErrorCategory;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  environment: string;
  release?: string;
  deviceInfo?: {
    os: string;
    browser: string;
    device: string;
    screenResolution?: string;
  };
  networkInfo?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}
