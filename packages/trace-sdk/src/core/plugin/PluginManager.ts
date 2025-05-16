import { IPlugin, PluginOptions } from './IPlugin';

/**
 * 插件管理器
 * 负责插件的注册、初始化和销毁
 */
export class PluginManager {
  // 存储已注册的插件
  private plugins: Map<string, IPlugin> = new Map();
  // 存储插件依赖关系
  private dependencies: Map<string, string[]> = new Map();

  /**
   * 注册插件
   * @param options 插件配置项
   */
  register(options: PluginOptions): void {
    let instance: IPlugin;

    // 判断是插件实例还是构造函数
    if (typeof options.plugin === 'function') {
      instance = new options.plugin();
    } else {
      instance = options.plugin;
    }

    // 检查插件名称是否已存在
    if (this.plugins.has(instance.name)) {
      console.warn(`插件 ${instance.name} 已存在，将被覆盖`);
    }

    // 存储插件实例
    this.plugins.set(instance.name, instance);

    // 如果配置为自动初始化，则初始化插件
    if (options.autoInit !== false) {
      this.initPlugin(instance.name, options.options);
    }
  }

  /**
   * 初始化指定插件
   * @param name 插件名称
   * @param options 初始化选项
   */
  initPlugin(name: string, options?: Record<string, any>): void {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      console.error(`插件 ${name} 不存在`);
      return;
    }

    // 确保依赖的插件已初始化
    const deps = this.dependencies.get(name) || [];
    for (const dep of deps) {
      if (!this.plugins.has(dep)) {
        console.error(`插件 ${name} 依赖的插件 ${dep} 不存在`);
        return;
      }
      this.initPlugin(dep);
    }

    try {
      plugin.init(options);
    } catch (error) {
      console.error(`插件 ${name} 初始化失败:`, error);
    }
  }

  /**
   * 获取插件实例
   * @param name 插件名称
   */
  getPlugin<T extends IPlugin>(name: string): T | undefined {
    return this.plugins.get(name) as T | undefined;
  }

  /**
   * 设置插件依赖关系
   * @param name 插件名称
   * @param dependencies 依赖的插件名称列表
   */
  setDependencies(name: string, dependencies: string[]): void {
    this.dependencies.set(name, dependencies);
  }

  /**
   * 销毁所有插件
   */
  destroyAll(): void {
    // 按照依赖关系的逆序销毁插件
    // 这里简化处理，直接遍历销毁
    for (const [name, plugin] of this.plugins.entries()) {
      try {
        plugin.destroy();
      } catch (error) {
        console.error(`插件 ${name} 销毁失败:`, error);
      }
    }
    this.plugins.clear();
    this.dependencies.clear();
  }
}
