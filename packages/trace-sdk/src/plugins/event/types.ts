/**
 * 事件类型枚举
 */
export enum EventType {
  /**
   * 点击事件
   */
  CLICK = 'click',

  /**
   * 路由变化事件
   */
  ROUTE = 'route',

  /**
   * 元素曝光事件
   */
  EXPOSURE = 'exposure',

  /**
   * 自定义事件
   */
  CUSTOM = 'custom',
}

/**
 * 事件信息接口
 */
export interface EventInfo {
  /**
   * 事件类型
   */
  type: EventType;

  /**
   * 事件发生时间
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

  /**
   * 元素信息（可选，点击事件等DOM相关事件会包含）
   */
  element?: {
    /**
     * 元素标签名
     */
    tagName: string;

    /**
     * 元素ID
     */
    id: string;

    /**
     * 元素类名
     */
    className: string;

    /**
     * 元素内部文本
     */
    innerText?: string;

    /**
     * 元素DOM路径
     */
    path: string;

    /**
     * 元素关键属性
     */
    attributes: Record<string, string>;
  };
}

/**
 * 事件过滤规则
 * 返回false表示忽略该事件，返回true表示保留该事件
 */
export type EventFilterRule = (eventInfo: EventInfo) => boolean;

/**
 * 事件监控插件配置选项
 */
export interface EventPluginOptions {
  /**
   * 是否监控点击事件
   */
  clickEvent?: boolean;

  /**
   * 是否监控路由变化事件
   */
  routeEvent?: boolean;

  /**
   * 是否监控元素曝光事件
   */
  exposureEvent?: boolean;

  /**
   * 是否监控自定义事件
   */
  customEvent?: boolean;

  /**
   * 采样率，范围0-1
   */
  samplingRate?: number;

  /**
   * 最大事件捕获数量
   */
  maxEventCount?: number;

  /**
   * 忽略的事件类型列表，支持字符串和正则表达式
   */
  ignoreEvents?: Array<string | RegExp>;

  /**
   * 自定义过滤规则
   */
  rules?: EventFilterRule[];
}
