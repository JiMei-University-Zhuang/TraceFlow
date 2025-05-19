/**
 * 性能指标类型枚举
 */
export enum PerformanceMetricType {
  /**
   * 页面加载性能指标
   */
  PAGE_LOAD = 'page_load',

  /**
   * 关键渲染指标
   */
  PAINT = 'paint',

  /**
   * 资源加载性能指标
   */
  RESOURCE = 'resource',

  /**
   * 网络请求性能指标
   */
  NETWORK = 'network',

  /**
   * 交互性能指标
   */
  INTERACTION = 'interaction',

  /**
   * JavaScript性能指标
   */
  JAVASCRIPT = 'javascript',

  /**
   * 内存性能指标
   */
  MEMORY = 'memory',

  /**
   * 长任务性能指标
   */
  LONG_TASK = 'long_task',

  /**
   * 自定义性能指标
   */
  CUSTOM = 'custom',
}

/**
 * 性能数据信息接口
 */
export interface PerformanceInfo {
  /**
   * 指标类型
   */
  type: PerformanceMetricType;

  /**
   * 指标名称
   */
  name: string;

  /**
   * 指标值
   */
  value: number;

  /**
   * 指标单位
   */
  unit: 'ms' | 'byte' | 'count' | 'percent' | 'fps' | 'score' | 'custom';

  /**
   * 指标上报时间
   */
  time: number;

  /**
   * 页面信息
   */
  pageInfo: {
    /**
     * 页面URL
     */
    url: string;

    /**
     * 页面标题
     */
    title: string;

    /**
     * 来源页面
     */
    referrer: string;
  };

  /**
   * 用户代理信息
   */
  userAgent: string;

  /**
   * 详细信息
   */
  detail: Record<string, any>;
}

/**
 * 页面加载性能指标接口
 */
export interface PageLoadMetrics {
  /**
   * 导航开始时间点（相对页面导航开始的时间）
   */
  navigationStart: number;

  /**
   * DOM完成时间点
   */
  domComplete: number;

  /**
   * 页面加载时间点
   */
  loadComplete: number;

  /**
   * 首次绘制时间点
   */
  firstPaint?: number;

  /**
   * 首次内容绘制时间点
   */
  firstContentfulPaint?: number;

  /**
   * 最大内容绘制时间点
   */
  largestContentfulPaint?: number;

  /**
   * 首次输入延迟
   */
  firstInputDelay?: number;

  /**
   * 累计布局偏移
   */
  cumulativeLayoutShift?: number;

  /**
   * DOM交互时间点
   */
  domInteractive: number;

  /**
   * 总下载大小（字节）
   */
  totalDownloadSize: number;

  /**
   * 资源数量
   */
  resourceCount: number;
}

/**
 * 资源加载性能接口
 */
export interface ResourceMetrics {
  /**
   * 资源URL
   */
  url: string;

  /**
   * 资源类型
   */
  initiatorType: string;

  /**
   * 资源大小
   */
  size: number;

  /**
   * 开始加载时间
   */
  startTime: number;

  /**
   * 响应结束时间
   */
  responseEnd: number;

  /**
   * 加载持续时间
   */
  duration: number;

  /**
   * DNS查询时间
   */
  dnsTime?: number;

  /**
   * TCP连接时间
   */
  tcpTime?: number;

  /**
   * SSL握手时间
   */
  sslTime?: number;

  /**
   * 请求时间
   */
  requestTime?: number;

  /**
   * 响应时间
   */
  responseTime?: number;
}

/**
 * 网络请求性能接口
 */
export interface NetworkMetrics {
  /**
   * 请求URL
   */
  url: string;

  /**
   * 请求方法
   */
  method: string;

  /**
   * 请求类型：xhr 或 fetch
   */
  type?: 'xhr' | 'fetch';

  /**
   * 状态码
   */
  status?: number;

  /**
   * 请求开始时间
   */
  startTime: number;

  /**
   * 请求结束时间
   */
  endTime: number;

  /**
   * 请求持续时间
   */
  duration: number;

  /**
   * 请求是否成功
   */
  success: boolean;

  /**
   * 错误信息
   */
  errorMessage?: string;

  /**
   * 请求大小
   */
  requestSize?: number;

  /**
   * 响应大小
   */
  responseSize?: number;

  /**
   * 请求头
   */
  requestHeaders?: Record<string, string>;

  /**
   * 响应头
   */
  responseHeaders?: Record<string, string>;
}

/**
 * 性能过滤规则
 * 返回false表示忽略该性能数据，返回true表示保留该性能数据
 */
export type PerformanceFilterRule = (performanceInfo: PerformanceInfo) => boolean;

/**
 * 性能监控插件配置选项
 */
export interface PerformancePluginOptions {
  /**
   * 是否监控页面加载性能
   */
  pageLoadMetrics?: boolean;

  /**
   * 是否监控资源加载性能
   */
  resourceMetrics?: boolean;

  /**
   * 是否监控网络请求性能
   */
  networkMetrics?: boolean;

  /**
   * 是否监控交互性能
   */
  interactionMetrics?: boolean;

  /**
   * 是否监控长任务
   */
  longTaskMetrics?: boolean;

  /**
   * 是否监控内存使用
   */
  memoryMetrics?: boolean;

  /**
   * 是否监控帧率
   */
  fpsMetrics?: boolean;

  /**
   * 采样率，范围0-1
   */
  samplingRate?: number;

  /**
   * 资源性能采样率，范围0-1
   */
  resourceSamplingRate?: number;

  /**
   * 性能数据上报间隔（毫秒）
   */
  reportInterval?: number;

  /**
   * 最大性能数据缓存数量
   */
  maxBufferSize?: number;

  /**
   * 忽略的性能指标列表，支持字符串和正则表达式
   */
  ignoreMetrics?: Array<string | RegExp>;

  /**
   * 自定义过滤规则
   */
  rules?: PerformanceFilterRule[];
}

export interface SDK {
  isStarted(): boolean;
  on(event: string, handler: () => void): void;
  send(data: any): void;
}

export interface Plugin {
  install(sdk: SDK): void;
}
