import { AbstractPlugin, PluginState } from '../system/AbstractPlugin';
import { TraceEventType, TraceEvent } from '../../core/types';
import { initJsError } from './handlers/js-error';
import { initPromiseError } from './handlers/promise-error';
import { initResourceError } from './handlers/resource-error';
import { initHttpError } from './handlers/http-error';
import { ErrorPluginOptions, ErrorType, ErrorInfo } from './types';

/**
 * 错误监控插件
 * 负责捕获运行时错误、Promise错误、资源加载错误、HTTP请求错误等
 */
export class ErrorPlugin extends AbstractPlugin {
  /**
   * 插件名称
   */
  name = 'error';

  /**
   * 插件版本
   */
  version = '1.0.0';

  /**
   * 插件配置项
   */
  private config: ErrorPluginOptions = {
    jsError: true,
    promiseError: true,
    resourceError: true,
    httpError: true,
    samplingRate: 1.0,
    maxErrorCount: 100,
    ignoreErrors: [],
    rules: [],
  };

  /**
   * 错误计数器
   */
  private errorCount = 0;

  /**
   * 是否启用追踪
   */
  private enabled = true;

  /**
   * 错误处理器移除函数集合
   */
  private removeHandlers: Array<() => void> = [];

  /**
   * 核心API，用于事件上报
   */
  private traceCore: any;

  /**
   * 初始化插件
   * @param options 配置选项
   */
  protected onInit(options: Record<string, any>): void {
    // 合并配置项
    this.config = {
      ...this.config,
      ...options,
    };

    // 获取核心API
    if (options.context && options.context.traceCore) {
      this.traceCore = options.context.traceCore;
    } else {
      this.logError('缺少traceCore上下文，错误监控插件无法正常工作');
      this.state = PluginState.ERROR;
      return;
    }

    // 安装错误监听器
    this.installErrorHandlers();

    this.logInfo('错误监控插件初始化完成');
  }

  /**
   * 销毁插件
   */
  protected onDestroy(): void {
    // 移除所有错误处理器
    this.removeAllErrorHandlers();
    this.logInfo('错误监控插件已销毁');
  }

  /**
   * 安装错误处理器
   */
  private installErrorHandlers(): void {
    try {
      // 安装JavaScript错误监听
      if (this.config.jsError) {
        const removeJsError = initJsError(this.handleError.bind(this));
        this.removeHandlers.push(removeJsError);
      }

      // 安装Promise错误监听
      if (this.config.promiseError) {
        const removePromiseError = initPromiseError(this.handleError.bind(this));
        this.removeHandlers.push(removePromiseError);
      }

      // 安装资源错误监听
      if (this.config.resourceError) {
        const removeResourceError = initResourceError(this.handleError.bind(this));
        this.removeHandlers.push(removeResourceError);
      }

      // 安装HTTP错误监听
      if (this.config.httpError) {
        const removeHttpError = initHttpError(this.handleError.bind(this));
        this.removeHandlers.push(removeHttpError);
      }
    } catch (error) {
      this.logError(`安装错误处理器失败: ${error}`);
    }
  }

  /**
   * 移除所有错误处理器
   */
  private removeAllErrorHandlers(): void {
    this.removeHandlers.forEach(remove => {
      try {
        remove();
      } catch (error) {
        this.logError(`移除错误处理器失败: ${error}`);
      }
    });
    this.removeHandlers = [];
  }

  /**
   * 处理捕获到的错误
   * @param errorType 错误类型
   * @param error 错误信息
   * @param metadata 附加元数据
   */
  private handleError(errorType: ErrorType, error: Error | ErrorEvent | PromiseRejectionEvent | Event, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    // 控制采样率
    if (Math.random() > (this.config.samplingRate || 1.0)) return;

    // 控制错误数量
    if (this.config.maxErrorCount && this.errorCount >= this.config.maxErrorCount) {
      if (this.errorCount === this.config.maxErrorCount) {
        this.logWarn(`错误数量已达上限 ${this.config.maxErrorCount}，后续错误将被忽略`);
        this.errorCount++;
      }
      return;
    }

    try {
      // 提取错误信息
      const errorInfo = this.extractErrorInfo(errorType, error, metadata);

      // 应用过滤规则
      if (this.shouldIgnoreError(errorInfo)) {
        return;
      }

      // 上报错误
      this.reportError(errorInfo);
      this.errorCount++;
    } catch (e) {
      this.logError(`处理错误时发生异常: ${e}`);
    }
  }

  /**
   * 提取错误信息
   * @param errorType 错误类型
   * @param error 错误对象
   * @param metadata 附加信息
   * @returns 错误信息对象
   */
  private extractErrorInfo(errorType: ErrorType, error: Error | ErrorEvent | PromiseRejectionEvent | Event, metadata?: Record<string, any>): ErrorInfo {
    let message = '';
    let stack = '';
    let detail: Record<string, any> = {};

    // 根据错误类型提取信息
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack || '';
      detail = { name: error.name };
    } else if (error instanceof ErrorEvent) {
      message = error.message;
      stack = (error as any).error?.stack || '';
      detail = {
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
      };
    } else if (error instanceof PromiseRejectionEvent) {
      const reason = error.reason;
      message = reason instanceof Error ? reason.message : String(reason);
      stack = reason instanceof Error ? reason.stack || '' : '';
      detail = { type: 'unhandled promise rejection' };
    } else if (error instanceof Event) {
      message = error.type;
      detail = {
        target: (error.target as HTMLElement)?.outerHTML?.slice(0, 200) || '不可序列化目标',
      };
    }

    // 当前页面信息
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    };

    return {
      type: errorType,
      message,
      stack,
      time: Date.now(),
      pageInfo,
      userAgent: navigator.userAgent,
      detail: {
        ...detail,
        ...metadata,
      },
    };
  }

  /**
   * 判断是否应该忽略此错误
   * @param errorInfo 错误信息
   * @returns 是否忽略
   */
  private shouldIgnoreError(errorInfo: ErrorInfo): boolean {
    // 检查忽略列表
    if (this.config.ignoreErrors) {
      for (const pattern of this.config.ignoreErrors) {
        if (typeof pattern === 'string' && errorInfo.message.includes(pattern)) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(errorInfo.message)) {
          return true;
        }
      }
    }

    // 应用自定义规则
    if (this.config.rules && this.config.rules.length > 0) {
      for (const rule of this.config.rules) {
        if (rule(errorInfo) === false) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 上报错误信息
   * @param errorInfo 错误信息
   */
  private reportError(errorInfo: ErrorInfo): void {
    if (!this.traceCore) return;

    // 创建错误事件
    const errorEvent: TraceEvent = {
      type: TraceEventType.ERROR,
      name: `${errorInfo.type}_error`,
      data: errorInfo,
      timestamp: errorInfo.time,
      pageUrl: errorInfo.pageInfo.url,
      tags: {
        errorType: errorInfo.type,
      },
    };

    // 上报错误事件
    this.traceCore.trackEvent(errorEvent);
    this.logDebug(`错误已上报: ${errorInfo.message}`);
  }

  /**
   * 暂停错误监控
   */
  public pause(): void {
    this.enabled = false;
    this.logInfo('错误监控已暂停');
  }

  /**
   * 恢复错误监控
   */
  public resume(): void {
    this.enabled = true;
    this.logInfo('错误监控已恢复');
  }

  /**
   * 手动上报错误
   * @param error 错误对象
   * @param metadata 附加信息
   */
  public captureError(error: Error, metadata?: Record<string, any>): void {
    this.handleError(ErrorType.MANUAL, error, metadata);
  }

  /**
   * 获取错误计数
   */
  public getErrorCount(): number {
    return this.errorCount;
  }

  /**
   * 重置错误计数
   */
  public resetErrorCount(): void {
    this.errorCount = 0;
  }
}
