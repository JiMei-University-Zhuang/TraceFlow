import { ExceptionMetrics, EngineConfig, Breadcrumb, UserInstance, TransportInstance } from './types';
import { initJsError } from './core/js-error';
import { initResourceError } from './core/resource-error';
import { initPromiseError } from './core/promise-error';
import { initHttpError } from './core/http-error';
import { EnhancedErrorHandler } from './core/enhanced-error-handler';

interface ErrorTrackingConfig {
  appId: string;
  reportUrl?: string;
  errorFilter?: (error: unknown) => boolean;
  samplingRate?: number;
  environment?: string;
  release?: string;
  tags?: Record<string, string>;
  onError?: (error: ExceptionMetrics) => void;
}

interface EngineInstance extends EngineConfig {
  appId: string;
  transportCategory: string;
  errorFilter?: (error: unknown) => boolean;
  samplingRate?: number;
  environment?: string;
  release?: string;
  tags?: Record<string, string>;
  userInstance: UserInstance;
  transportInstance: TransportInstance;
  onError?: (error: ExceptionMetrics) => void;
}

class ErrorTracking {
  private static instance: ErrorTracking | null = null;
  private engineInstance!: EngineInstance;
  private submitErrorUids: Set<string> = new Set();
  private initialized: boolean = false;
  private errorHandler!: EnhancedErrorHandler;

  private constructor() {}

  static getInstance(): ErrorTracking {
    if (!ErrorTracking.instance) {
      ErrorTracking.instance = new ErrorTracking();
    }
    return ErrorTracking.instance;
  }

  initialize(engineInstance: EngineInstance): void {
    if (this.initialized) {
      console.warn('ErrorTracking has already been initialized');
      return;
    }

    this.engineInstance = engineInstance;

    // 初始化增强的错误处理器
    this.errorHandler = new EnhancedErrorHandler({
      samplingRate: engineInstance.samplingRate || 1.0,
      maxQueueSize: 100,
      environment: engineInstance.environment || 'production',
      release: engineInstance.release,
      tags: engineInstance.tags,
    });

    this.initialized = true;
    this.init();
  }

  private init(): void {
    // 初始化各类错误监听
    initJsError(this.errorSendHandler);
    initResourceError(this.errorSendHandler);
    initPromiseError(this.errorSendHandler);
    initHttpError(this.errorSendHandler);
  }

  // 错误处理
  private errorSendHandler = (error: Error | ExceptionMetrics): void => {
    try {
      const errorEvent = error instanceof Error ? this.errorHandler.handleError(error) : error;

      if (!errorEvent) return; // 如果错误被采样过滤，直接返回

      if (this.engineInstance.errorFilter && !this.engineInstance.errorFilter(errorEvent)) {
        return;
      }

      // 错误去重
      if (this.submitErrorUids.has(errorEvent.errorUid)) {
        return;
      }
      this.submitErrorUids.add(errorEvent.errorUid);

      // 触发错误回调
      if (this.engineInstance.onError) {
        this.engineInstance.onError(errorEvent);
      }
    } catch (e) {
      console.error('Error handling failed:', e);
    }
  };

  // 手动上报错误
  public report(error: Error): void {
    if (!this.isInitialized()) {
      console.error('ErrorTracking must be initialized before reporting errors');
      return;
    }

    try {
      const errorEvent = this.errorHandler.handleError(error);
      if (errorEvent) {
        this.errorSendHandler(errorEvent);
      }
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }

  // 检查是否已初始化
  public isInitialized(): boolean {
    return this.initialized;
  }

  public setCrumb(crumb: { key: string; value: Breadcrumb }): void {
    this.engineInstance.userInstance.breadcrumbs.set(crumb.key, crumb.value);
  }

  public removeCrumb(key: string): void {
    this.engineInstance.userInstance.breadcrumbs.remove(key);
  }
}

// 导出 errorTracking 实例
export const errorTracking = {
  init(config: ErrorTrackingConfig): ErrorTracking {
    const engineInstance: EngineInstance = {
      transportCategory: 'error',
      environment: config.environment || 'production',
      samplingRate: config.samplingRate,
      release: config.release,
      tags: config.tags,
      onError: config.onError,
      userInstance: {
        breadcrumbs: {
          get: () => [],
          clear: () => {},
          add: (_crumb: Breadcrumb) => {},
          set: (_key: string, _value: Breadcrumb) => {},
          remove: (_key: string) => {},
        },
        metrics: {
          get: (_key: string) => ({}),
          set: (_key: string, _value: unknown) => {},
        },
      },
      transportInstance: {
        kernelTransportHandler: () => {},
        formatTransportData: (_category: string, data: unknown) => data,
      },
      ...config,
    };

    const instance = ErrorTracking.getInstance();
    instance.initialize(engineInstance);
    return instance;
  },
};
