import { initPageLoadMetrics, initResourceMetrics } from './handlers';
import { PerformanceMetricType, PerformanceInfo, PerformancePluginOptions } from './types';

/**
 * 性能监控数据处理器类型
 */
export type PerformanceDataHandler = (data: PerformanceInfo) => void;

/**
 * 性能监控插件
 */
export class PerformanceMonitor {
  private options: PerformancePluginOptions;
  private handlers: PerformanceDataHandler[] = [];
  private cleanupFunctions: Array<() => void> = [];
  private enabled = false;

  /**
   * 创建性能监控实例
   * @param options 性能监控配置选项
   */
  constructor(options: PerformancePluginOptions = {}) {
    this.options = {
      // 默认配置
      pageLoadMetrics: true,
      resourceMetrics: true,
      samplingRate: 1.0,
      resourceSamplingRate: 0.5,
      reportInterval: 10000,
      maxBufferSize: 100,
      ignoreMetrics: [],
      ...options,
    };
  }

  /**
   * 添加数据处理器
   * @param handler 数据处理函数
   */
  public addHandler(handler: PerformanceDataHandler): void {
    this.handlers.push(handler);
  }

  /**
   * 移除数据处理器
   * @param handler 要移除的数据处理函数
   */
  public removeHandler(handler: PerformanceDataHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  /**
   * 启动性能监控
   */
  public start(): void {
    if (this.enabled) {
      return;
    }

    this.enabled = true;

    // 初始化并启动页面加载性能监控
    if (this.options.pageLoadMetrics) {
      const cleanup = initPageLoadMetrics((metricType, metrics, metadata) => {
        this.handlePerformanceData(metricType, 'page_load', metrics, metadata);
      });
      this.cleanupFunctions.push(cleanup);
    }

    // 初始化并启动资源加载性能监控
    if (this.options.resourceMetrics) {
      const cleanup = initResourceMetrics((metricType, metrics, metadata) => {
        this.handlePerformanceData(metricType, 'resource', metrics, metadata);
      }, this.options.resourceSamplingRate);
      this.cleanupFunctions.push(cleanup);
    }

    console.log('[TraceSDK][Performance] 性能监控已启动');
  }

  /**
   * 停止性能监控
   */
  public stop(): void {
    if (!this.enabled) {
      return;
    }

    // 执行所有清理函数
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    this.enabled = false;

    console.log('[TraceSDK][Performance] 性能监控已停止');
  }

  /**
   * 处理性能数据
   * @param metricType 指标类型
   * @param name 指标名称
   * @param value 指标值
   * @param metadata 元数据
   */
  private handlePerformanceData(metricType: PerformanceMetricType, name: string, value: Record<string, any>, metadata?: Record<string, any>): void {
    try {
      // 应用采样率过滤
      if (Math.random() > this.options.samplingRate!) {
        return;
      }

      // 应用忽略规则
      if (this.shouldIgnoreMetric(name)) {
        return;
      }

      // 创建性能数据信息对象
      const performanceInfo: PerformanceInfo = {
        type: metricType,
        name,
        value: this.getMainMetricValue(metricType, value),
        unit: this.getMetricUnit(metricType),
        time: Date.now(),
        pageInfo: {
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
        },
        userAgent: navigator.userAgent,
        detail: {
          ...value,
          ...(metadata || {}),
        },
      };

      // 应用自定义过滤规则
      if (this.options.rules && this.options.rules.length > 0) {
        const shouldKeep = this.options.rules.every(rule => rule(performanceInfo));
        if (!shouldKeep) {
          return;
        }
      }

      // 分发数据给所有处理器
      this.handlers.forEach(handler => {
        try {
          handler(performanceInfo);
        } catch (err) {
          console.error('[TraceSDK][Performance] 处理器错误:', err);
        }
      });
    } catch (err) {
      console.error('[TraceSDK][Performance] 处理性能数据错误:', err);
    }
  }

  /**
   * 检查是否应忽略指标
   * @param name 指标名称
   */
  private shouldIgnoreMetric(name: string): boolean {
    if (!this.options.ignoreMetrics || this.options.ignoreMetrics.length === 0) {
      return false;
    }

    return this.options.ignoreMetrics.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(name);
      }
      return name === pattern;
    });
  }

  /**
   * 获取主要指标值
   */
  private getMainMetricValue(type: PerformanceMetricType, data: any): number {
    switch (type) {
      case PerformanceMetricType.PAGE_LOAD:
        return data.loadComplete || 0;
      case PerformanceMetricType.RESOURCE:
        return data.duration || 0;
      default:
        return 0;
    }
  }

  /**
   * 获取指标单位
   */
  private getMetricUnit(type: PerformanceMetricType): 'ms' | 'byte' | 'count' | 'percent' | 'fps' | 'score' | 'custom' {
    switch (type) {
      case PerformanceMetricType.PAGE_LOAD:
      case PerformanceMetricType.RESOURCE:
        return 'ms';
      default:
        return 'custom';
    }
  }
}
