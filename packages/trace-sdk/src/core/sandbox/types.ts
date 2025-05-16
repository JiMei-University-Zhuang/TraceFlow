/**
 * 沙箱类型枚举
 */
export enum SandboxType {
  IFRAME = 'iframe', // 基于iframe的沙箱
  PROXY = 'proxy', // 基于Proxy的沙箱
}

/**
 * 沙箱配置选项
 */
export interface SandboxOptions {
  // 沙箱类型
  type?: SandboxType;

  // 允许访问的全局对象列表
  allowList?: string[];

  // 拒绝访问的全局对象列表
  denyList?: string[];

  // 是否启用严格模式
  strict?: boolean;

  // 自定义上下文对象
  context?: Record<string, unknown>;

  // 是否自动恢复原始环境（执行后）
  autoRestore?: boolean;
}

/**
 * 沙箱接口
 */
export interface ISandbox {
  /**
   * 获取沙箱环境
   */
  getContext(): Record<string, unknown>;

  /**
   * 在沙箱中执行代码
   * @param code 要执行的代码字符串或函数
   * @param args 执行函数时传递的参数
   */
  run<T = unknown>(code: string | ((...args: unknown[]) => unknown), ...args: unknown[]): T;

  /**
   * 重置沙箱环境至初始状态
   */
  reset(): void;

  /**
   * 销毁沙箱，释放资源
   */
  destroy(): void;
}

/**
 * 沙箱事件类型
 */
export enum SandboxEventType {
  CREATED = 'sandbox_created', // 沙箱创建
  BEFORE_EXECUTION = 'before_execution', // 执行前
  AFTER_EXECUTION = 'after_execution', // 执行后
  ERROR = 'error', // 执行错误
  DESTROYED = 'sandbox_destroyed', // 沙箱销毁
}

/**
 * 沙箱事件监听器
 */
export type SandboxEventListener = (event: SandboxEventType, data?: unknown) => void;
