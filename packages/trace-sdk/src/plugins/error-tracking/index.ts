import { ExceptionMetrics } from './types/index';
import { initJsError } from './core/js-error';
import { initResourceError } from './core/resource-error';
import { initPromiseError } from './core/promise-error';
import { initHttpError } from './core/http-error';
import { EnhancedErrorHandler } from './core/enhanced-error-handler';

interface ErrorTrackingConfig {
  appId: string;
  errorFilter?: (error: unknown) => boolean;
  samplingRate?: number;
  environment?: string;
  release?: string;
  tags?: Record<string, string>;
  onError?: (error: { eventData: ExceptionMetrics }) => void;
}

class ErrorTracking {
  private static instance: ErrorTracking | null = null;
  private config!: ErrorTrackingConfig;
  private initialized: boolean = false;
  private errorHandler!: EnhancedErrorHandler;

  private constructor() {}

  static getInstance(): ErrorTracking {
    if (!ErrorTracking.instance) {
      ErrorTracking.instance = new ErrorTracking();
    }
    return ErrorTracking.instance;
  }

  initialize(config: ErrorTrackingConfig): void {
    if (this.initialized) {
      console.warn('ErrorTracking has already been initialized');
      return;
    }

    this.config = config;

    // 初始化增强的错误处理器
    this.errorHandler = new EnhancedErrorHandler({
      samplingRate: config.samplingRate || 1.0,
      maxQueueSize: 100,
      environment: config.environment || 'production',
      release: config.release,
      tags: config.tags,
    });

    this.initialized = true;
    this.init();
  }

  private init(): void {
    // 初始化各类错误监听
    initJsError(this.errorCallback);
    initResourceError(this.errorCallback);
    initPromiseError(this.errorCallback);
    initHttpError(this.errorCallback);
  }

  // 错误回调处理
  private errorCallback = (error: Error | ExceptionMetrics): void => {
    try {
      const errorEvent = error instanceof Error ? this.errorHandler.handleError(error) : error;

      if (!errorEvent) return; // 如果错误被采样过滤，直接返回

      if (this.config.errorFilter && !this.config.errorFilter(errorEvent)) {
        return;
      }

      // 触发错误回调，将错误数据传递给 Tracker
      if (this.config.onError) {
        this.config.onError({ eventData: errorEvent });
      }
    } catch (e) {
      console.error('Error handling failed:', e);
    }
  };

  // 检查是否已初始化
  public isInitialized(): boolean {
    return this.initialized;
  }
}

// 导出 errorTracking 实例
export const errorTracking = {
  init(config: ErrorTrackingConfig): ErrorTracking {
    const instance = ErrorTracking.getInstance();
    instance.initialize(config);
    return instance;
  },
};
