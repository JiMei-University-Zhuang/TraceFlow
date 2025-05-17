/**
 * 插件接口定义
 * 所有的插件都必须实现此接口
 */
export interface IPlugin {
  /**
   * 插件名称
   */
  name: string;

  /**
   * 插件版本
   */
  version: string;

  /**
   * 插件初始化方法
   * @param options 初始化选项
   */
  init(options?: Record<string, any>): void;

  /**
   * 插件销毁方法
   */
  destroy(): void;
}

/**
 * 插件构造函数类型
 */
export type PluginConstructor = new () => IPlugin;

/**
 * 插件配置项
 */
export interface PluginOptions {
  // 插件实例或构造函数
  plugin: IPlugin | PluginConstructor;
  // 是否自动初始化
  autoInit?: boolean;
  // 初始化选项
  options?: Record<string, any>;
}
