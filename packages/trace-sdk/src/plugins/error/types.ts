/**
 * 错误类型枚举
 */
export enum ErrorType {
  /**
   * JS运行时错误
   */
  JS = 'js',

  /**
   * Promise未捕获错误
   */
  PROMISE = 'promise',

  /**
   * 资源加载错误
   */
  RESOURCE = 'resource',

  /**
   * HTTP请求错误
   */
  HTTP = 'http',

  /**
   * 手动上报的错误
   */
  MANUAL = 'manual',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  /**
   * 错误类型
   */
  type: ErrorType;

  /**
   * 错误消息
   */
  message: string;

  /**
   * 错误堆栈
   */
  stack: string;

  /**
   * 错误发生时间
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
 * 错误过滤规则
 * 返回false表示忽略该错误，返回true表示保留该错误
 */
export type ErrorFilterRule = (errorInfo: ErrorInfo) => boolean;

/**
 * 错误监控插件配置选项
 */
export interface ErrorPluginOptions {
  /**
   * 是否监控JS错误
   */
  jsError?: boolean;

  /**
   * 是否监控Promise错误
   */
  promiseError?: boolean;

  /**
   * 是否监控资源加载错误
   */
  resourceError?: boolean;

  /**
   * 是否监控HTTP请求错误
   */
  httpError?: boolean;

  /**
   * 采样率，范围0-1
   */
  samplingRate?: number;

  /**
   * 最大错误捕获数量
   */
  maxErrorCount?: number;

  /**
   * 忽略的错误信息列表，支持字符串和正则表达式
   */
  ignoreErrors?: Array<string | RegExp>;

  /**
   * 自定义过滤规则
   */
  rules?: ErrorFilterRule[];
}
