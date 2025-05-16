/**
 * 队列优先级枚举
 */
export enum QueuePriority {
  HIGH = 'high', // 高优先级，用于实时发送关键错误
  MEDIUM = 'medium', // 中优先级，用于批量发送一般数据
  LOW = 'low', // 低优先级，利用浏览器空闲时间处理
}

/**
 * 队列项类型，所有加入队列的数据都必须包含这些基本信息
 */
export interface QueueItem {
  // 唯一标识符
  id: string;
  // 数据内容
  data: any;
  // 优先级
  priority: QueuePriority;
  // 时间戳
  timestamp: number;
  // 重试次数
  retryCount?: number;
  // 最大重试次数
  maxRetries?: number;
}

/**
 * 队列配置项
 */
export interface QueueConfig {
  // 队列最大长度，超过后会执行溢出策略
  maxLength?: number;
  // 溢出策略：丢弃最旧的数据或丢弃最新的数据
  overflowStrategy?: 'discardOldest' | 'discardNewest';
  // 是否自动处理队列
  autoFlush?: boolean;
  // 自动处理的时间间隔（毫秒）
  flushInterval?: number;
  // 每次处理的最大数量
  batchSize?: number;
}

/**
 * 队列事件类型
 */
export enum QueueEventType {
  ITEM_ADDED = 'item_added',
  ITEM_REMOVED = 'item_removed',
  QUEUE_FLUSHED = 'queue_flushed',
  OVERFLOW = 'overflow',
  ERROR = 'error',
}

/**
 * 队列事件处理函数类型
 */
export type QueueEventHandler = (eventType: QueueEventType, data?: any) => void;
