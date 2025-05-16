import { PluginManager } from './plugin/PluginManager';
import { IPlugin, PluginOptions } from './plugin/IPlugin';
import { AbstractSandbox, ProxySandbox } from './sandbox';
import { SandboxOptions, SandboxType } from './sandbox/types';

/**
 * TraceFlow SDK 核心配置选项
 */
export interface TraceCoreOptions {
  /**
   * 应用标识
   */
  appId: string;

  /**
   * 是否开启调试模式
   */
  debug?: boolean;

  /**
   * 自动启动，默认为 true
   */
  autoStart?: boolean;

  /**
   * 最大缓冲事件数量，默认为 100
   */
  maxBufferSize?: number;

  /**
   * 上报URL
   */
  reportUrl?: string;

  /**
   * 使用的沙箱类型
   */
  sandboxType?: SandboxType;

  /**
   * 沙箱配置选项
   */
  sandboxOptions?: SandboxOptions;

  /**
   * 插件配置集合
   */
  plugins?: Record<string, any>;

  /**
   * 自定义扩展配置
   */
  [key: string]: any;
}

/**
 * TraceFlow 事件类型
 */
export enum TraceEventType {
  /**
   * 错误事件
   */
  ERROR = 'error',

  /**
   * 性能事件
   */
  PERFORMANCE = 'performance',

  /**
   * 用户行为事件
   */
  BEHAVIOR = 'behavior',

  /**
   * 网络请求事件
   */
  NETWORK = 'network',

  /**
   * 自定义事件
   */
  CUSTOM = 'custom',

  /**
   * 生命周期事件
   */
  LIFECYCLE = 'lifecycle',

  /**
   * 系统事件
   */
  SYSTEM = 'system',
}

/**
 * 事件数据结构
 */
export interface TraceEvent<T = any> {
  /**
   * 事件类型
   */
  type: TraceEventType;

  /**
   * 事件名称
   */
  name: string;

  /**
   * 事件数据
   */
  data: T;

  /**
   * 事件时间戳
   */
  timestamp: number;

  /**
   * 事件标签
   */
  tags?: Record<string, string>;

  /**
   * 事件唯一标识
   */
  id?: string;
}

/**
 * TraceFlow SDK 核心类
 * 负责插件管理、事件处理、沙箱隔离等核心功能
 */
export class TraceCore {
  /**
   * 全局单例
   */
  private static instance: TraceCore;

  /**
   * 核心配置选项
   */
  private options: TraceCoreOptions;

  /**
   * 插件管理器
   */
  private pluginManager: PluginManager;

  /**
   * 沙箱实例
   */
  private sandbox!: AbstractSandbox;

  /**
   * 事件缓冲区
   */
  private eventBuffer: TraceEvent[] = [];

  /**
   * 是否已初始化
   */
  private initialized = false;

  /**
   * 是否已启动
   */
  private started = false;

  /**
   * 获取全局单例
   */
  public static getInstance(options?: TraceCoreOptions): TraceCore {
    if (!TraceCore.instance) {
      TraceCore.instance = new TraceCore(options || { appId: 'default' });
    } else if (options) {
      TraceCore.instance.updateOptions(options);
    }
    return TraceCore.instance;
  }

  /**
   * 构造函数
   * @param options 初始化选项
   */
  private constructor(options: TraceCoreOptions) {
    this.options = {
      debug: false,
      autoStart: true,
      maxBufferSize: 100,
      ...options,
    };

    // 创建插件管理器
    this.pluginManager = new PluginManager();

    // 创建沙箱环境
    this.createSandbox();

    // 自动启动
    if (this.options.autoStart) {
      this.init().then(() => this.start());
    }
  }

  /**
   * 更新配置选项
   * @param options 新的配置选项
   */
  public updateOptions(options: Partial<TraceCoreOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };

    // 如果沙箱类型变更，重新创建沙箱
    if (options.sandboxType && this.options.sandboxType !== options.sandboxType) {
      this.createSandbox();
    }
  }

  /**
   * 初始化SDK
   */
  public async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 初始化所有插件
      this.initializeAllPlugins();

      this.initialized = true;

      // 记录初始化事件
      this.trackEvent({
        type: TraceEventType.LIFECYCLE,
        name: 'sdk_initialized',
        data: {
          version: '1.0.0', // 这里可以从package.json中获取
          options: this.options,
        },
        timestamp: Date.now(),
      });

      if (this.options.debug) {
        console.log('[TraceFlow🌈] SDK 初始化成功');
      }
    } catch (error) {
      if (this.options.debug) {
        console.error('[TraceFlow🌈] SDK 初始化失败', error);
      }

      // 记录初始化失败事件
      this.trackEvent({
        type: TraceEventType.ERROR,
        name: 'sdk_init_error',
        data: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 初始化所有已注册的插件
   */
  private initializeAllPlugins(): void {
    // 获取沙箱上下文
    const context = this.getSandboxContext();

    // 遍历所有插件进行初始化
    for (const plugin of this.getAllPlugins()) {
      try {
        plugin.init({
          ...this.options.plugins?.[plugin.name],
          context,
        });
      } catch (error) {
        if (this.options.debug) {
          console.error(`[TraceFlow] 插件 ${plugin.name} 初始化失败`, error);
        }
      }
    }
  }

  /**
   * 启动SDK监控
   */
  public async start(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    if (this.started) {
      return;
    }

    try {
      // 启动所有插件
      this.startAllPlugins();

      this.started = true;

      // 记录启动事件
      this.trackEvent({
        type: TraceEventType.LIFECYCLE,
        name: 'sdk_started',
        data: {},
        timestamp: Date.now(),
      });

      if (this.options.debug) {
        console.log('[TraceFlow] SDK 启动成功');
      }
    } catch (error) {
      if (this.options.debug) {
        console.error('[TraceFlow] SDK 启动失败', error);
      }

      // 记录启动失败事件
      this.trackEvent({
        type: TraceEventType.ERROR,
        name: 'sdk_start_error',
        data: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 启动所有已注册的插件
   */
  private startAllPlugins(): void {
    // 这里可以根据需求添加插件启动逻辑
    // 如果IPlugin接口本身没有start方法，这里可以自行设计插件的启动逻辑
  }

  /**
   * 停止SDK监控
   */
  public async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    try {
      // 停止所有插件
      this.stopAllPlugins();

      this.started = false;

      // 记录停止事件
      this.trackEvent({
        type: TraceEventType.LIFECYCLE,
        name: 'sdk_stopped',
        data: {},
        timestamp: Date.now(),
      });

      if (this.options.debug) {
        console.log('[TraceFlow] SDK 已停止');
      }
    } catch (error) {
      if (this.options.debug) {
        console.error('[TraceFlow] SDK 停止失败', error);
      }
    }
  }

  /**
   * 停止所有已注册的插件
   */
  private stopAllPlugins(): void {
    // 这里可以根据需求添加插件停止逻辑
    // 如果IPlugin接口本身没有stop方法，这里可以自行设计插件的停止逻辑
  }

  /**
   * 销毁SDK实例
   */
  public async destroy(): Promise<void> {
    try {
      // 先停止SDK
      await this.stop();

      // 销毁所有插件
      this.pluginManager.destroyAll();

      // 销毁沙箱
      this.sandbox.destroy();

      // 清空事件缓冲区
      this.eventBuffer = [];

      this.initialized = false;

      // 记录销毁事件
      this.trackEvent({
        type: TraceEventType.LIFECYCLE,
        name: 'sdk_destroyed',
        data: {},
        timestamp: Date.now(),
      });

      // 立即上报销毁事件
      this.flushEvents();

      if (this.options.debug) {
        console.log('[TraceFlow] SDK 已销毁');
      }
    } catch (error) {
      if (this.options.debug) {
        console.error('[TraceFlow] SDK 销毁失败', error);
      }
    }
  }

  /**
   * 注册插件
   * @param plugin 插件实例
   */
  public registerPlugin(plugin: IPlugin): void {
    const options: PluginOptions = {
      plugin: plugin,
      autoInit: this.initialized, // 如果SDK已初始化，则自动初始化插件
    };

    this.pluginManager.register(options);

    if (this.options.debug) {
      console.log(`[TraceFlow] 插件 ${plugin.name} 已注册`);
    }

    // 如果SDK已启动，则手动初始化插件
    if (this.initialized) {
      plugin.init({
        context: this.getSandboxContext(),
        ...this.options.plugins?.[plugin.name],
      });
    }
  }

  /**
   * 卸载插件
   * @param pluginName 插件名称
   */
  public unregisterPlugin(pluginName: string): void {
    const plugin = this.pluginManager.getPlugin(pluginName);
    if (plugin) {
      plugin.destroy();
    }

    // 从插件列表中移除（需要扩展PluginManager添加remove方法）
    // 暂时没有从插件管理器中移除插件的方法，可以后续扩展

    if (this.options.debug) {
      console.log(`[TraceFlow] 插件 ${pluginName} 已卸载`);
    }
  }

  /**
   * 获取插件实例
   * @param pluginName 插件名称
   */
  public getPlugin<T extends IPlugin>(pluginName: string): T | null {
    return (this.pluginManager.getPlugin(pluginName) as T) || null;
  }

  /**
   * 获取所有插件实例
   */
  private getAllPlugins(): IPlugin[] {
    const plugins: IPlugin[] = [];
    // 遍历所有插件
    // 由于PluginManager没有提供获取所有插件的方法，这里需要扩展
    // 暂时返回空数组
    return plugins;
  }

  /**
   * 跟踪事件
   * @param event 事件对象
   */
  public trackEvent(event: TraceEvent): void {
    // 添加到缓冲区
    this.eventBuffer.push({
      ...event,
      timestamp: event.timestamp || Date.now(),
    });

    // 如果缓冲区已满，则执行上报
    if (this.eventBuffer.length >= (this.options.maxBufferSize || 100)) {
      this.flushEvents();
    }
  }

  /**
   * 手动上报事件
   */
  public flushEvents(): void {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    // 实现上报逻辑
    if (this.options.reportUrl) {
      try {
        fetch(this.options.reportUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appId: this.options.appId,
            timestamp: Date.now(),
            events,
          }),
        }).catch(error => {
          if (this.options.debug) {
            console.error('[TraceFlow] 事件上报失败', error);
          }
        });
      } catch (error) {
        if (this.options.debug) {
          console.error('[TraceFlow] 事件上报失败', error);
        }
      }
    } else if (this.options.debug) {
      console.log('[TraceFlow] 事件数据:', events);
    }
  }

  /**
   * 创建沙箱环境
   */
  private createSandbox(): void {
    const sandboxOptions = this.options.sandboxOptions || {};
    this.sandbox = new ProxySandbox(sandboxOptions);
  }

  /**
   * 获取沙箱上下文
   */
  public getSandboxContext(): Record<string, any> {
    return {
      ...this.sandbox.getContext(),
      traceCore: this.getPublicAPI(),
    };
  }

  /**
   * 获取公共API
   * 提供给插件使用的API
   */
  private getPublicAPI(): Record<string, any> {
    return {
      trackEvent: this.trackEvent.bind(this),
      getOptions: () => ({ ...this.options }),
      getPlugin: this.getPlugin.bind(this),
      version: '1.0.0', // 这里可以从package.json中获取
    };
  }
}

// 导出单例获取方法
export const getTraceCore = TraceCore.getInstance;
