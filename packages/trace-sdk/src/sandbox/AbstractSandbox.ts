import { ISandbox, SandboxEventListener, SandboxEventType, SandboxOptions, SandboxType } from './types';

/**
 * 沙箱抽象基类
 * 实现通用功能，具体沙箱实现类需要继承此类
 */
export abstract class AbstractSandbox implements ISandbox {
  // 沙箱类型
  protected type: SandboxType;

  // 沙箱配置选项
  protected options: Required<SandboxOptions>;

  // 事件监听器集合
  protected eventListeners: Map<SandboxEventType, SandboxEventListener[]> = new Map();

  // 默认配置
  private static readonly DEFAULT_OPTIONS: Required<SandboxOptions> = {
    type: SandboxType.PROXY,
    allowList: [],
    denyList: ['document.cookie', 'localStorage', 'sessionStorage', 'indexedDB'],
    strict: true,
    context: {},
    autoRestore: true,
  };

  /**
   * 构造函数
   * @param options 沙箱配置选项
   */
  constructor(options: SandboxOptions = {}) {
    // 合并默认选项和用户传入的选项
    this.options = {
      ...AbstractSandbox.DEFAULT_OPTIONS,
      ...options,
    };

    this.type = this.options.type;

    // 创建沙箱环境
    this.setupContext();

    // 触发创建事件
    this.emit(SandboxEventType.CREATED, { type: this.type });
  }

  /**
   * 在沙箱中执行代码
   * @param code 要执行的代码字符串或函数
   * @param args 执行函数时传递的参数
   */
  run<T = unknown>(code: string | ((...args: unknown[]) => unknown), ...args: unknown[]): T {
    try {
      // 执行前触发事件
      this.emit(SandboxEventType.BEFORE_EXECUTION, { code });

      // 执行代码
      const result = this.executeInSandbox(code, args);

      // 执行后触发事件
      this.emit(SandboxEventType.AFTER_EXECUTION, { code, result });

      // 如果配置了自动恢复，则恢复原始环境
      if (this.options.autoRestore) {
        this.reset();
      }

      return result as T;
    } catch (error) {
      // 执行错误，触发错误事件
      this.emit(SandboxEventType.ERROR, { code, error });
      throw error;
    }
  }

  /**
   * 重置沙箱环境至初始状态
   */
  reset(): void {
    this.resetContext();
  }

  /**
   * 销毁沙箱，释放资源
   */
  destroy(): void {
    // 清理资源
    this.cleanupResources();

    // 清空事件监听器
    this.eventListeners.clear();

    // 触发销毁事件
    this.emit(SandboxEventType.DESTROYED, { type: this.type });
  }

  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event: SandboxEventType, listener: SandboxEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数，如果不提供则移除该事件类型的所有监听器
   */
  off(event: SandboxEventType, listener?: SandboxEventListener): void {
    if (!this.eventListeners.has(event)) {
      return;
    }

    if (!listener) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  protected emit(event: SandboxEventType, data?: unknown): void {
    const listeners = this.eventListeners.get(event) || [];

    for (const listener of listeners) {
      try {
        listener(event, data);
      } catch (error) {
        console.error(`Error in sandbox event listener for ${event}:`, error);
      }
    }
  }

  /**
   * 初始化沙箱上下文环境
   * 由子类实现
   */
  protected abstract setupContext(): void;

  /**
   * 在沙箱中执行代码
   * 由子类实现
   * @param code 要执行的代码或函数
   * @param args 执行函数时传递的参数
   */
  protected abstract executeInSandbox(code: string | ((...args: unknown[]) => unknown), args: unknown[]): unknown;

  /**
   * 重置沙箱上下文环境
   * 由子类实现
   */
  protected abstract resetContext(): void;

  /**
   * 清理沙箱相关资源
   * 由子类实现
   */
  protected abstract cleanupResources(): void;

  /**
   * 获取沙箱环境
   * 由子类实现
   */
  public abstract getContext(): Record<string, unknown>;
}
