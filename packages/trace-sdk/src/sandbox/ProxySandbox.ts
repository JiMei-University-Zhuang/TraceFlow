import { AbstractSandbox } from './AbstractSandbox';
import { SandboxOptions } from './types';

/**
 * 基于Proxy的沙箱实现
 * 使用ES6 Proxy API创建隔离的执行环境
 */
export class ProxySandbox extends AbstractSandbox {
  // 沙箱上下文
  private sandboxContext: Record<string, unknown> = {};

  // 原始快照, 用于重置沙箱
  private originalContext: Record<string, unknown> = {};

  /**
   * 构造函数
   * @param options 沙箱配置选项
   */
  constructor(options?: SandboxOptions) {
    super(options);
  }

  /**
   * 获取沙箱上下文
   */
  getContext(): Record<string, unknown> {
    return this.sandboxContext;
  }

  /**
   * 初始化沙箱上下文环境
   */
  protected setupContext(): void {
    // 基础上下文，默认包含部分全局对象
    const baseContext: Record<string, unknown> = {
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval,
      Date: Date,
      Math: Math,
      JSON: JSON,
      Object: Object,
      Array: Array,
      String: String,
      Number: Number,
      Boolean: Boolean,
      Error: Error,
      Symbol: Symbol,
      ...this.options.context,
    };

    // 保存原始上下文快照
    this.originalContext = { ...baseContext };

    // 使用Proxy创建沙箱上下文
    this.sandboxContext = new Proxy(baseContext, {
      // 获取属性时的拦截器
      get: (target, property, receiver) => {
        // 检查是否在拒绝名单中
        if (this.isPropertyInDenyList(String(property))) {
          console.warn(`[ProxySandbox] 访问被禁止的属性: ${String(property)}`);
          return undefined;
        }

        // 如果目标对象有该属性，则返回
        if (property in target) {
          const value = Reflect.get(target, property, receiver);
          return value;
        }

        // 否则，如果是严格模式，返回undefined；否则尝试从全局对象获取
        if (this.options.strict) {
          return undefined;
        } else {
          // 尝试从全局对象（window或global）获取
          const globalObj = typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : {};

          if (property in globalObj) {
            const value = (globalObj as Record<PropertyKey, unknown>)[property];
            return value;
          }

          return undefined;
        }
      },

      // 设置属性时的拦截器
      set: (target, property, value, receiver) => {
        // 检查是否在拒绝名单中
        if (this.isPropertyInDenyList(String(property))) {
          console.warn(`[ProxySandbox] 修改被禁止的属性: ${String(property)}`);
          return false;
        }

        // 设置属性值
        return Reflect.set(target, property, value, receiver);
      },

      // 删除属性时的拦截器
      deleteProperty: (target, property) => {
        // 检查是否在拒绝名单中
        if (this.isPropertyInDenyList(String(property))) {
          console.warn(`[ProxySandbox] 删除被禁止的属性: ${String(property)}`);
          return false;
        }

        // 如果属性存在于目标对象，则删除
        if (property in target) {
          return Reflect.deleteProperty(target, property);
        }

        return true;
      },

      // 判断属性是否存在时的拦截器
      has: (target, property) => {
        // 检查是否在拒绝名单中
        if (this.isPropertyInDenyList(String(property))) {
          return false;
        }

        // 如果属性存在于目标对象，则返回true
        if (property in target) {
          return true;
        }

        // 在严格模式下，只检查目标对象
        if (this.options.strict) {
          return false;
        }

        // 非严格模式，检查全局对象
        const globalObj = typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : {};
        return property in globalObj;
      },

      // 获取对象自身属性名时的拦截器
      ownKeys: target => {
        // 获取目标对象的所有自身属性名
        const keys = Reflect.ownKeys(target);

        // 过滤掉拒绝名单中的属性
        return keys.filter(key => !this.isPropertyInDenyList(String(key)));
      },
    });
  }

  /**
   * 在沙箱中执行代码
   * @param code 要执行的代码或函数
   * @param args 执行函数时传递的参数
   */
  protected executeInSandbox(code: string | ((...args: unknown[]) => unknown), args: unknown[] = []): unknown {
    if (typeof code === 'function') {
      // 如果是函数，则直接在沙箱上下文中调用
      return code.apply(this.sandboxContext, args);
    } else {
      // 如果是字符串代码，则使用Function构造器创建函数并执行
      // 使用with语句将沙箱上下文注入到代码执行环境
      const strictPrefix = this.options.strict ? '"use strict";' : '';
      const contextParams = Object.keys(this.sandboxContext);
      const contextValues = contextParams.map(key => this.sandboxContext[key]);

      try {
        // 创建一个新的Function，将沙箱上下文作为参数传入
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const fn = new Function(
          ...contextParams,
          `${strictPrefix}
          return (function() {
            ${code}
          }).apply(this, arguments);
        `,
        );

        // 执行函数，将沙箱上下文作为参数传入
        return fn.apply(this.sandboxContext, [...contextValues, ...args]);
      } catch (error) {
        console.error('[ProxySandbox] 执行代码错误:', error);
        throw error;
      }
    }
  }

  /**
   * 重置沙箱上下文环境
   */
  protected resetContext(): void {
    // 清空当前上下文，仅保留原始快照中的属性
    Object.keys(this.sandboxContext).forEach(key => {
      if (!(key in this.originalContext)) {
        delete this.sandboxContext[key];
      } else {
        this.sandboxContext[key] = this.originalContext[key];
      }
    });
  }

  /**
   * 清理沙箱相关资源
   */
  protected cleanupResources(): void {
    // Proxy沙箱没有特殊的资源需要清理
    this.sandboxContext = null as unknown as Record<string, unknown>;
    this.originalContext = {};
  }

  /**
   * 判断属性是否在拒绝名单中
   * @param propPath 属性路径
   */
  private isPropertyInDenyList(propPath: string): boolean {
    return this.options.denyList.some(item => {
      // 精确匹配
      if (item === propPath) {
        return true;
      }

      // 前缀匹配（如 'document.'）
      if (item.endsWith('.') && propPath.startsWith(item)) {
        return true;
      }

      // 包含匹配
      if (item.includes('*')) {
        const regex = new RegExp('^' + item.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return regex.test(propPath);
      }

      return false;
    });
  }
}
