import { ExceptionMetrics, EngineConfig, Breadcrumb, UserInstance, TransportInstance } from './types';
import { initJsError } from './core/js-error';
import { initResourceError } from './core/resource-error';
import { initPromiseError } from './core/promise-error';
import { initHttpError } from './core/http-error';
import { EnhancedErrorHandler } from './core/enhanced-error-handler';

interface ErrorTrackingConfig {
  appId: string;
  reportUrl?: string;
  batchReport?: boolean;
  batchSize?: number;
  batchTimeout?: number;
  queueSize?: number;
  errorFilter?: (error: unknown) => boolean;
  samplingRate?: number;
  environment?: string;
  release?: string;
  tags?: Record<string, string>;
}

interface EngineInstance extends EngineConfig {
  appId: string;
  reportUrl?: string;
  batchReport?: boolean;
  batchSize?: number;
  batchTimeout?: number;
  queueSize?: number;
  persistQueueSize?: number;
  errorFilter?: (error: unknown) => boolean;
  transportCategory: string;
  userInstance: UserInstance;
  transportInstance: TransportInstance;
  samplingRate?: number;
  environment?: string;
  release?: string;
  tags?: Record<string, string>;
}

class ErrorQueue {
  private queue: Array<ExceptionMetrics>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.queue = [];
    this.maxSize = maxSize;
  }

  enqueue(error: ExceptionMetrics): void {
    if (this.queue.length >= this.maxSize) {
      this.queue.shift(); // 移除最早的错误
    }
    this.queue.push(error);
  }

  dequeue(): ExceptionMetrics | undefined {
    return this.queue.shift();
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }

  getAll(): Array<ExceptionMetrics> {
    return [...this.queue];
  }
}

class ErrorTracking {
  private static instance: ErrorTracking | null = null;
  private engineInstance!: EngineConfig;
  private submitErrorUids: Set<string> = new Set();
  private eventHandlers: Map<string, Set<(event: ExceptionMetrics) => void>> = new Map();
  private readonly ERROR_CATEGORY = 'error';
  private reportQueue!: ErrorQueue;
  private persistQueue!: ErrorQueue;
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
      maxQueueSize: engineInstance.queueSize || 100,
      environment: engineInstance.environment || 'production',
      release: engineInstance.release,
      tags: engineInstance.tags,
    });

    // 从配置中获取队列大小
    const queueSize = engineInstance?.queueSize || 100;
    const persistQueueSize = engineInstance?.persistQueueSize || 1000;

    this.reportQueue = new ErrorQueue(queueSize);
    this.persistQueue = new ErrorQueue(persistQueueSize);
    this.initialized = true;
    this.init();
  }

  private init(): void {
    // 初始化各类错误监听
    initJsError(this.errorSendHandler);
    initResourceError(this.errorSendHandler);
    initPromiseError(this.errorSendHandler);
    initHttpError(this.errorSendHandler);

    // 启动定时上报和持久化
    if (this.engineInstance.batchReport) {
      this.startBatchReporting();
    }
    this.startPersistenceTask();
  }

  private startBatchReporting(): void {
    const config = this.engineInstance;
    const batchSize = config?.batchSize || 5;
    const batchTimeout = config?.batchTimeout || 3000;

    setInterval(() => {
      if (this.reportQueue.size() >= batchSize) {
        this.sendBatchErrors();
      }
    }, batchTimeout);
  }

  private sendBatchErrors(): void {
    const errors = this.reportQueue.getAll();
    if (errors.length === 0) return;

    this.reportQueue.clear();
    this.engineInstance.transportInstance.kernelTransportHandler(
      this.engineInstance.transportInstance.formatTransportData(this.ERROR_CATEGORY, {
        type: 'batch_errors',
        errors,
        timestamp: Date.now(),
      }),
    );
  }

  private startPersistenceTask(): void {
    // 定期将持久化队列中的错误存储到 IndexedDB
    setInterval(() => {
      const errors = this.persistQueue.getAll();
      if (errors.length === 0) return;

      this.persistQueue.clear();
      this.persistErrorsToIndexedDB(errors);
    }, 5000);
  }

  private async persistErrorsToIndexedDB(errors: ExceptionMetrics[]): Promise<void> {
    try {
      const db = await this.getIndexedDB();
      const tx = db.transaction('errors', 'readwrite');
      const store = tx.objectStore('errors');

      for (const error of errors) {
        store.add({
          ...error,
          persistTime: Date.now(),
        });
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Error persisting to IndexedDB:', error);
    }
  }

  private async getIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('error-tracking', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('errors')) {
          db.createObjectStore('errors', { keyPath: 'errorUid' });
        }
      };
    });
  }

  // 错误上报处理
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

      // 发送错误
      this.emit('error', errorEvent);
    } catch (e) {
      console.error('Error handling failed:', e);
    }
  };

  // 获取浏览器信息
  private getBrowserInfo(): { name: string; version: string } {
    const userAgent = navigator.userAgent;
    let browserName = 'unknown';
    let browserVersion = 'unknown';

    if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
    }

    return { name: browserName, version: browserVersion };
  }

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

  // 确定错误严重程度
  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    } else if (error.name === 'SyntaxError') {
      return 'critical';
    }
    return 'medium';
  }

  // 分类错误
  private categorizeError(error: Error): string {
    switch (error.name) {
      case 'TypeError':
      case 'ReferenceError':
        return 'runtime';
      case 'SyntaxError':
        return 'syntax';
      case 'NetworkError':
      case 'AbortError':
        return 'network';
      case 'SecurityError':
        return 'security';
      default:
        return 'other';
    }
  }

  // 触发事件
  private emit(eventName: string, data: ExceptionMetrics): void {
    if (!this.isInitialized()) {
      console.error('ErrorTracking must be initialized before emitting events');
      return;
    }

    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${eventName} event handler:`, error);
        }
      });
    }
  }

  // 注册事件监听器
  public on(eventName: string, callback: (event: ExceptionMetrics) => void): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName)?.add(callback);
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

  private addBreadcrumb(_crumb: Breadcrumb): void {
    // 实现面包屑添加逻辑
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
        kernelTransportHandler: (data: unknown) => {
          console.log('Error data:', data);
        },
        formatTransportData: (_category: string, data: unknown) => data,
      },
      ...config,
    };

    const instance = ErrorTracking.getInstance();
    instance.initialize(engineInstance);
    return instance;
  },

  report(error: Error): void {
    const instance = ErrorTracking.getInstance();
    if (!instance.isInitialized()) {
      console.error('ErrorTracking must be initialized before reporting errors');
      return;
    }
    instance.report(error);
  },

  on(eventName: string, callback: (event: ExceptionMetrics) => void): void {
    const instance = ErrorTracking.getInstance();
    if (!instance.isInitialized()) {
      console.error('ErrorTracking must be initialized before adding event listeners');
      return;
    }
    instance.on(eventName, callback);
  },

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
};

type ErrorHandler = (error: unknown) => void;

export const addBreadcrumb = (_message: string, _data?: Record<string, unknown>): void => {
  // 实现逻辑
};

export const setContext = (_key: string, _value: unknown): void => {
  // 实现逻辑
};

export const setUser = (_user: { id?: string; username?: string; email?: string }): void => {
  // 实现逻辑
};

export const captureException = (_error: unknown): void => {
  // 实现逻辑
};

export const captureMessage = (_message: string): void => {
  // 实现逻辑
};

export const addGlobalErrorHandler = (_handler: ErrorHandler): void => {
  // 实现逻辑
};
