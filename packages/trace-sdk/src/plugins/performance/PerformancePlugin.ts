import { PerformanceInfo, PerformancePluginOptions, Plugin, SDK } from './types';
import { PerformanceMonitor } from './PerformanceMonitor';

// 创建默认实例
const performance = new PerformanceMonitor();

/**
 * 性能监控插件
 */
export class PerformancePlugin implements Plugin {
  /**
   * 插件名称
   */
  public static readonly pluginName = 'performance';

  /**
   * SDK实例
   */
  private sdk?: SDK;

  /**
   * 插件配置选项
   */
  private options: PerformancePluginOptions;

  /**
   * 构造函数
   * @param options 插件配置选项
   */
  constructor(options: PerformancePluginOptions = {}) {
    this.options = options;
    // 配置性能监控器
    Object.assign(performance, new PerformanceMonitor(options));
  }

  /**
   * 安装插件
   * @param sdk SDK实例
   */
  public install(sdk: SDK): void {
    this.sdk = sdk;

    // 配置性能监控
    performance.addHandler(data => this.handlePerformanceData(data));

    // 注册SDK事件监听
    this.sdk.on('start', () => this.start());
    this.sdk.on('stop', () => this.stop());

    // 如果SDK已经启动，则启动插件
    if (sdk.isStarted()) {
      this.start();
    }
  }

  /**
   * 启动插件
   */
  public start(): void {
    performance.start();
  }

  /**
   * 停止插件
   */
  public stop(): void {
    performance.stop();
  }

  /**
   * 处理性能数据
   * @param data 性能数据
   */
  private handlePerformanceData(data: PerformanceInfo): void {
    if (!this.sdk) {
      return;
    }

    // 通过SDK发送数据
    this.sdk.send({
      category: 'performance',
      type: data.type,
      name: data.name,
      time: data.time,
      data: {
        value: data.value,
        unit: data.unit,
        pageInfo: data.pageInfo,
        detail: data.detail,
      },
    });
  }
}

/**
 * 创建性能监控插件的工厂函数
 * @param options 插件配置选项
 * @returns 性能监控插件实例
 */
export function createPerformancePlugin(options?: PerformancePluginOptions): PerformancePlugin {
  return new PerformancePlugin(options);
}

// 导出性能监控实例，方便直接使用
export { performance };
