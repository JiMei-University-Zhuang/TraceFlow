import { IdleScheduler, IdleTask } from './IdleScheduler';
import { QueueEventType, QueueItem, QueueManager, QueuePriority } from './QueueManager';

/**
 * 策略配置
 */
export interface StrategyConfig {
  // 是否启用实时发送（高优先级数据）
  enableRealtime?: boolean;
  // 是否启用批量发送（中优先级数据）
  enableBatch?: boolean;
  // 是否启用空闲发送（低优先级数据）
  enableIdle?: boolean;
  // 批量发送间隔（毫秒）
  batchInterval?: number;
  // 每批次最大数量
  batchSize?: number;
  // 空闲调度超时（毫秒）
  idleTimeout?: number;
  // 每个空闲期最大处理数量
  maxTasksPerIdle?: number;
}

/**
 * 数据处理回调函数类型
 */
export type DataProcessorFn = (items: QueueItem[]) => Promise<void> | void;

/**
 * 策略管理器
 * 协调不同类型的队列和调度策略，实现多级优先级数据处理
 */
export class StrategyManager {
  // 队列管理器
  private queueManager: QueueManager;
  // 空闲调度器
  private idleScheduler: IdleScheduler;
  // 配置
  private config: Required<StrategyConfig>;
  // 数据处理器
  private dataProcessor: DataProcessorFn;
  // 是否已初始化
  private initialized: boolean = false;
  // 批处理定时器ID
  private batchTimerId: number | null = null;

  // 默认配置
  private static readonly DEFAULT_CONFIG: Required<StrategyConfig> = {
    enableRealtime: true,
    enableBatch: true,
    enableIdle: true,
    batchInterval: 5000,
    batchSize: 10,
    idleTimeout: 2000,
    maxTasksPerIdle: 5,
  };

  /**
   * 构造函数
   * @param dataProcessor 数据处理回调函数
   * @param config 策略配置
   */
  constructor(dataProcessor: DataProcessorFn, config: StrategyConfig = {}) {
    this.config = {
      ...StrategyManager.DEFAULT_CONFIG,
      ...config,
    };

    // 初始化队列管理器
    this.queueManager = new QueueManager({
      maxLength: 1000,
      overflowStrategy: 'discardOldest',
      autoFlush: false, // 禁用自动刷新，由策略管理器控制
      batchSize: this.config.batchSize,
    });

    // 初始化空闲调度器
    this.idleScheduler = new IdleScheduler({
      timeout: this.config.idleTimeout,
      maxTasksPerIdle: this.config.maxTasksPerIdle,
    });

    // 保存数据处理回调
    this.dataProcessor = dataProcessor;
  }

  /**
   * 初始化管理器
   */
  init(): void {
    if (this.initialized) {
      return;
    }

    // 监听队列处理事件
    this.queueManager.on(QueueEventType.QUEUE_FLUSHED, (_, data) => {
      if (data && data.items && data.items.length > 0) {
        this.processItems(data.items);
      }
    });

    // 启动批处理定时器
    if (this.config.enableBatch) {
      this.startBatchProcessing();
    }

    this.initialized = true;
  }

  /**
   * 添加数据项
   * @param item 数据项
   */
  addItem(item: QueueItem): void {
    if (!this.initialized) {
      this.init();
    }

    // 根据优先级和配置决定处理方式
    if (item.priority === QueuePriority.HIGH && this.config.enableRealtime) {
      // 高优先级，直接处理
      this.processItems([item]);
    } else if (item.priority === QueuePriority.MEDIUM && this.config.enableBatch) {
      // 中优先级，添加到批量队列
      this.queueManager.enqueue(item);
    } else if (item.priority === QueuePriority.LOW && this.config.enableIdle) {
      // 低优先级，添加到空闲调度队列
      this.addToIdleQueue(item);
    } else {
      // 默认添加到队列管理器
      this.queueManager.enqueue(item);
    }
  }

  /**
   * 批量添加数据项
   * @param items 数据项数组
   */
  addItems(items: QueueItem[]): void {
    for (const item of items) {
      this.addItem(item);
    }
  }

  /**
   * 添加任务到空闲调度队列
   * @param item 队列项
   */
  private addToIdleQueue(item: QueueItem): void {
    const idleTask: IdleTask = {
      id: item.id,
      execute: () => {
        return Promise.resolve(this.processItems([item]));
      },
      priority: 0, // 默认优先级
    };

    this.idleScheduler.addTask(idleTask);
  }

  /**
   * 启动批处理定时器
   */
  private startBatchProcessing(): void {
    if (this.batchTimerId !== null) {
      return;
    }

    this.batchTimerId = window.setInterval(() => {
      if (this.queueManager.getLength(QueuePriority.MEDIUM) > 0) {
        this.queueManager.flush(QueuePriority.MEDIUM);
      }
    }, this.config.batchInterval);
  }

  /**
   * 停止批处理定时器
   */
  private stopBatchProcessing(): void {
    if (this.batchTimerId !== null) {
      clearInterval(this.batchTimerId);
      this.batchTimerId = null;
    }
  }

  /**
   * 处理数据项
   * @param items 数据项数组
   */
  private async processItems(items: QueueItem[]): Promise<void> {
    if (!items || items.length === 0) {
      return;
    }

    try {
      // 调用数据处理器
      await Promise.resolve(this.dataProcessor(items));
    } catch (error) {
      console.error('Error processing items:', error);

      // 错误处理逻辑，可以根据需要重试、记录日志等
    }
  }

  /**
   * 立即处理队列中的数据
   * @param priority 优先级，不指定则处理所有优先级
   */
  flush(priority?: QueuePriority): void {
    this.queueManager.flush(priority);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopBatchProcessing();
    this.queueManager.destroy();
    this.idleScheduler.clear();
    this.idleScheduler.stop();
  }
}
