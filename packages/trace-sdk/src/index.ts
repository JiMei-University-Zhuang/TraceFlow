import { getTraceCore, TraceCore, TraceCoreOptions } from './core/TraceCore';
import { ErrorPlugin } from './plugins/error';
import { EventPlugin } from './plugins/event';
import { PerformancePlugin, createPerformancePlugin } from './plugins/performance';
import { TraceEventType, TraceEvent } from './core/types';
import { SandboxType } from './sandbox/types';
import { PerformancePluginOptions } from './plugins/performance/types';
import { EventPluginOptions } from './plugins/event/types';
import { IPlugin } from './plugins/system/IPlugin';

/**
 * TraceFlow SDK配置选项
 */
export interface TraceSDKOptions extends TraceCoreOptions {
  /**
   * 应用标识
   */
  appId: string;

  /**
   * 调试模式
   */
  debug?: boolean;

  /**
   * 上报URL
   */
  reportUrl?: string;

  /**
   * 环境标识
   */
  environment?: 'development' | 'test' | 'production';

  /**
   * 版本号
   */
  version?: string;

  /**
   * 自定义标签
   */
  tags?: Record<string, string>;

  /**
   * 错误监控插件配置
   */
  errorPlugin?: {
    /**
     * 是否启用JS错误监控
     */
    jsError?: boolean;

    /**
     * 是否启用Promise错误监控
     */
    promiseError?: boolean;

    /**
     * 是否启用资源加载错误监控
     */
    resourceError?: boolean;

    /**
     * 是否启用HTTP请求错误监控
     */
    httpError?: boolean;

    /**
     * 错误采样率
     */
    samplingRate?: number;

    /**
     * 忽略的错误信息
     */
    ignoreErrors?: Array<string | RegExp>;
  };

  /**
   * 事件监控插件配置
   */
  eventPlugin?: EventPluginOptions;

  /**
   * 性能监控插件配置
   */
  performancePlugin?: PerformancePluginOptions;

  /**
   * 插件配置
   */
  plugins?: Record<string, any>;
}

/**
 * TraceFlow SDK
 * 提供应用监控、错误跟踪、性能分析等功能
 */
class TraceSDK {
  /**
   * 全局单例
   */
  private static instance: TraceSDK;

  /**
   * 核心实例
   */
  private core: TraceCore;

  /**
   * 配置选项
   */
  private options: TraceSDKOptions;

  /**
   * 构造函数
   * @param options 配置选项
   */
  private constructor(options: TraceSDKOptions) {
    this.options = options;

    // 创建核心实例
    this.core = getTraceCore({
      appId: options.appId,
      debug: options.debug,
      reportUrl: options.reportUrl,
      autoStart: options.autoStart,
      maxBufferSize: options.maxBufferSize,
      sandboxType: options.sandboxType || SandboxType.PROXY,
      plugins: options.plugins,
    });

    // 初始化SDK
    this.init();
  }

  /**
   * 获取全局单例
   * @param options 配置选项
   * @returns SDK实例
   */
  public static getInstance(options: TraceSDKOptions): TraceSDK {
    if (!TraceSDK.instance) {
      TraceSDK.instance = new TraceSDK(options);
    }
    return TraceSDK.instance;
  }

  /**
   * 初始化SDK
   */
  private init(): void {
    // 注册错误监控插件
    if (this.options.plugins?.error !== false) {
      this.initErrorPlugin();
    }

    // 注册事件监控插件
    if (this.options.plugins?.event !== false) {
      this.initEventPlugin();
    }

    // 注册性能监控插件
    if (this.options.plugins?.performance !== false) {
      this.initPerformancePlugin();
    }
  }

  /**
   * 初始化错误监控插件
   */
  private initErrorPlugin(): void {
    const errorPlugin = new ErrorPlugin();
    // 如果有配置选项，使用init方法初始化
    if (this.options.errorPlugin) {
      errorPlugin.init({
        ...this.options.errorPlugin,
        context: { traceCore: this.core },
      });
    }

    // 注册错误插件
    this.core.registerPlugin(errorPlugin);
  }

  /**
   * 初始化事件监控插件
   */
  private initEventPlugin(): void {
    const eventPlugin = new EventPlugin();
    // 如果有配置选项，使用init方法初始化
    if (this.options.eventPlugin) {
      eventPlugin.init({
        ...this.options.eventPlugin,
        context: { traceCore: this.core },
      });
    }

    // 注册事件插件
    this.core.registerPlugin(eventPlugin);
  }

  /**
   * 初始化性能监控插件
   */
  private initPerformancePlugin(): void {
    // 创建性能监控插件
    const performancePlugin = createPerformancePlugin(this.options.performancePlugin) as unknown as IPlugin;

    // 注册性能监控插件
    this.core.registerPlugin(performancePlugin);
  }

  /**
   * 手动上报事件
   * @param type 事件类型
   * @param name 事件名称
   * @param data 事件数据
   */
  public track(type: TraceEventType, name: string, data: any): void {
    const event: TraceEvent = {
      type,
      name,
      data,
      timestamp: Date.now(),
      tags: this.options.tags,
    };

    this.core.trackEvent(event);
  }

  /**
   * 手动上报错误
   * @param error 错误对象
   * @param metadata 元数据
   */
  public captureError(error: Error, metadata?: Record<string, any>): void {
    const errorPlugin = this.core.getPlugin<ErrorPlugin>('error');
    if (errorPlugin) {
      errorPlugin.captureError(error, metadata);
    }
  }

  /**
   * 手动上报用户行为事件
   * @param eventName 事件名称
   * @param eventData 事件数据
   */
  public captureEvent(eventName: string, eventData?: Record<string, any>): void {
    const eventPlugin = this.core.getPlugin<EventPlugin>('event');
    if (eventPlugin) {
      eventPlugin.captureEvent(eventName, eventData);
    }
  }

  /**
   * 手动上报性能指标
   * @param metricName 指标名称
   * @param value 指标值
   * @param unit 单位
   * @param metadata 元数据
   */
  public trackPerformance(metricName: string, value: number, unit?: string, metadata?: Record<string, any>): void {
    // 使用一般的track方法上报性能数据
    this.track(TraceEventType.PERFORMANCE, metricName, {
      value,
      unit,
      ...metadata,
    });
  }

  /**
   * 启动SDK
   */
  public start(): void {
    this.core.start();
  }

  /**
   * 停止SDK
   */
  public stop(): void {
    this.core.stop();
  }

  /**
   * 检查SDK是否已启动
   * 注意：此方法依赖于TraceCore内部实现
   */
  public isStarted(): boolean {
    return !!this.core && !!(this.core as any).started;
  }

  /**
   * 立即上报所有事件
   */
  public flush(): void {
    this.core.flushEvents();
  }
}

// 导出SDK实例获取方法
export const init = (options: TraceSDKOptions): TraceSDK => {
  return TraceSDK.getInstance(options);
};

// 导出核心类型
export { TraceEventType, TraceEvent, SandboxType };

// 导出插件
export { ErrorPlugin, EventPlugin, PerformancePlugin };
export * from './plugins/performance/types';
export * from './plugins/error/types';
export * from './plugins/event/types';
