import { IPlugin } from './IPlugin';

/**
 * 插件状态枚举
 */
export enum PluginState {
  CREATED = 'created', // 创建完成
  INITIALIZING = 'initializing', // 正在初始化
  INITIALIZED = 'initialized', // 已初始化
  DESTROYING = 'destroying', // 正在销毁
  DESTROYED = 'destroyed', // 已销毁
  ERROR = 'error', // 错误状态
}

/**
 * 抽象插件基类
 * 实现IPlugin接口的通用功能，提供子类可以复用的通用方法
 */
export abstract class AbstractPlugin implements IPlugin {
  // 插件名称
  abstract name: string;
  // 插件版本
  abstract version: string;

  // 插件状态
  protected state: PluginState = PluginState.CREATED;
  // 插件选项
  protected options: Record<string, any> = {};
  // 错误信息
  protected error: Error | null = null;

  /**
   * 初始化插件
   * @param options 插件选项
   */
  init(options?: Record<string, any>): void {
    if (this.state === PluginState.INITIALIZED) {
      this.logWarn(`插件 ${this.name} 已经初始化，请勿重复初始化`);
      return;
    }

    try {
      this.state = PluginState.INITIALIZING;
      this.options = options || {};

      // 执行具体初始化逻辑
      this.onInit(this.options);

      this.state = PluginState.INITIALIZED;
      this.logInfo(`插件 ${this.name} 初始化完成`);
    } catch (err) {
      this.state = PluginState.ERROR;
      this.error = err instanceof Error ? err : new Error(String(err));
      this.logError(`插件 ${this.name} 初始化失败: ${this.error.message}`);
      throw this.error;
    }
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    if (this.state === PluginState.DESTROYED) {
      this.logWarn(`插件 ${this.name} 已经销毁，请勿重复销毁`);
      return;
    }

    try {
      this.state = PluginState.DESTROYING;

      // 执行具体销毁逻辑
      this.onDestroy();

      this.state = PluginState.DESTROYED;
      this.logInfo(`插件 ${this.name} 销毁完成`);
    } catch (err) {
      this.state = PluginState.ERROR;
      this.error = err instanceof Error ? err : new Error(String(err));
      this.logError(`插件 ${this.name} 销毁失败: ${this.error.message}`);
      throw this.error;
    }
  }

  /**
   * 检查插件是否已初始化
   */
  isInitialized(): boolean {
    return this.state === PluginState.INITIALIZED;
  }

  /**
   * 检查插件是否已销毁
   */
  isDestroyed(): boolean {
    return this.state === PluginState.DESTROYED;
  }

  /**
   * 获取插件状态
   */
  getState(): PluginState {
    return this.state;
  }

  /**
   * 获取插件选项
   */
  getOptions(): Record<string, any> {
    return { ...this.options };
  }

  /**
   * 获取插件错误
   */
  getError(): Error | null {
    return this.error;
  }

  /**
   * 子类需要实现的初始化方法
   * @param options 插件选项
   */
  protected abstract onInit(options: Record<string, any>): void;

  /**
   * 子类需要实现的销毁方法
   */
  protected abstract onDestroy(): void;

  /**
   * 记录信息日志
   * @param message 日志信息
   */
  protected logInfo(message: string): void {
    console.info(`[${this.name}] ${message}`);
  }

  /**
   * 记录警告日志
   * @param message 警告信息
   */
  protected logWarn(message: string): void {
    console.warn(`[${this.name}] ${message}`);
  }

  /**
   * 记录错误日志
   * @param message 错误信息
   */
  protected logError(message: string): void {
    console.error(`[${this.name}] ${message}`);
  }

  /**
   * 记录调试日志
   * @param message 调试信息
   */
  protected logDebug(message: string): void {
    console.debug(`[${this.name}] ${message}`);
  }
}
