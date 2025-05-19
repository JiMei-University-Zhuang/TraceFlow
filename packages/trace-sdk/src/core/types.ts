/**
 * TraceFlow SDK 核心类型定义
 */

/**
 * TraceFlow 事件类型
 */
export enum TraceEventType {
  /**
   * 错误事件
   */
  ERROR = 'error',

  /**
   * 性能事件
   */
  PERFORMANCE = 'performance',

  /**
   * 用户行为事件
   */
  BEHAVIOR = 'behavior',

  /**
   * 网络请求事件
   */
  NETWORK = 'network',

  /**
   * 自定义事件
   */
  CUSTOM = 'custom',

  /**
   * 生命周期事件
   */
  LIFECYCLE = 'lifecycle',

  /**
   * 系统事件
   */
  SYSTEM = 'system',
}

/**
 * 事件数据结构
 */
export interface TraceEvent<T = any> {
  /**
   * 事件类型
   */
  type: TraceEventType;

  /**
   * 事件名称
   */
  name: string;

  /**
   * 事件数据
   */
  data: T;

  /**
   * 事件时间戳
   */
  timestamp: number;

  /**
   * 事件标签
   */
  tags?: Record<string, string>;

  /**
   * 事件唯一标识
   */
  id?: string;

  /**
   * 发生页面URL
   */
  pageUrl?: string;

  /**
   * 用户ID
   */
  userId?: string;

  /**
   * 重试次数
   */
  attempts?: number;
}

/**
 * 上报策略类型
 */
export enum ReportStrategyType {
  /**
   * Beacon API，适用于离开页面前的最后请求
   */
  BEACON = 'beacon',

  /**
   * XMLHttpRequest，常规请求
   */
  XHR = 'xhr',

  /**
   * 图片请求，用于简单数据上报
   */
  IMG = 'img',

  /**
   * 自动选择最佳策略
   */
  AUTO = 'auto',
}

/**
 * 上报端点配置
 */
export interface ReportEndpoint {
  /**
   * 即时上报地址
   */
  immediate: string;

  /**
   * 批量上报地址
   */
  batch: string;
}

/**
 * 自动追踪配置
 */
export interface AutoTrackOptions {
  /**
   * 是否自动追踪页面访问
   */
  pageView?: boolean;

  /**
   * 是否自动追踪点击事件
   */
  click?: boolean;

  /**
   * 是否自动追踪性能指标
   */
  performance?: boolean;

  /**
   * 是否自动追踪路由变化
   */
  routerChange?: boolean;

  /**
   * 是否自动追踪网络请求
   */
  network?: boolean;

  /**
   * 是否自动追踪错误
   */
  error?: boolean;
}

/**
 * 用户页面基本信息
 */
export interface PageInformation {
  /**
   * 主机名
   */
  host: string;

  /**
   * 完整URL
   */
  href: string;

  /**
   * 页面标题
   */
  title: string;

  /**
   * 页面语言
   */
  language: string;

  /**
   * 窗口屏幕尺寸
   */
  winScreen: string;

  /**
   * 文档屏幕尺寸
   */
  docScreen: string;
}

/**
 * 来源信息
 */
export interface OriginInformation {
  /**
   * 引荐来源
   */
  referrer: string;

  /**
   * 来源类型
   */
  type: number | string;
}

/**
 * 用户行为记录
 */
export interface BehaviorRecord {
  /**
   * 行为名称
   */
  name: string;

  /**
   * 发生页面
   */
  page: string;

  /**
   * 时间戳
   */
  timestamp: number;

  /**
   * 行为值/详情
   */
  value: Record<string, any>;
}

/**
 * 兼容旧版API的别名定义
 * @deprecated 使用新的命名规范
 */
export type behaviorStack = BehaviorRecord;
export type TrackEvent = TraceEvent;
export type ReportStrategy = keyof typeof ReportStrategyType;
export type Endpoint = ReportEndpoint;
