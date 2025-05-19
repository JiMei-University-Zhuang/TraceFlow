import { QueueConfig, QueueEventHandler, QueueEventType, QueueItem, QueuePriority } from './types';

// 重新导出类型，供其他模块使用
export { QueueConfig, QueueEventType, QueueItem, QueuePriority };

/**
 * 队列管理器
 * 负责管理不同优先级的数据队列，实现数据的分级处理
 */
export class QueueManager {
  // 存储不同优先级的队列
  private queues: Map<QueuePriority, QueueItem[]> = new Map();
  // 队列配置
  private config: QueueConfig;
  // 事件监听器
  private eventListeners: Map<QueueEventType, QueueEventHandler[]> = new Map();
  // 自动处理定时器ID
  private flushTimerId: number | null = null;

  /**
   * 构造函数
   * @param config 队列配置
   */
  constructor(config: QueueConfig = {}) {
    // 设置默认配置
    this.config = {
      maxLength: 1000,
      overflowStrategy: 'discardOldest',
      autoFlush: true,
      flushInterval: 5000,
      batchSize: 10,
      ...config,
    };

    // 初始化各优先级队列
    this.queues.set(QueuePriority.HIGH, []);
    this.queues.set(QueuePriority.MEDIUM, []);
    this.queues.set(QueuePriority.LOW, []);

    // 如果配置为自动处理，启动定时任务
    if (this.config.autoFlush) {
      this.startAutoFlush();
    }
  }

  /**
   * 添加数据到队列
   * @param item 队列项
   */
  enqueue(item: QueueItem): void {
    // 确保存在对应优先级的队列
    if (!this.queues.has(item.priority)) {
      this.queues.set(item.priority, []);
    }

    const queue = this.queues.get(item.priority)!;

    // 检查队列长度是否超过限制
    if (this.config.maxLength && queue.length >= this.config.maxLength) {
      this.handleOverflow(item.priority);
    }

    // 添加项到队列
    queue.push(item);

    // 触发添加事件
    this.emit(QueueEventType.ITEM_ADDED, {
      priority: item.priority,
      item,
    });

    // 如果是高优先级数据，立即处理
    if (item.priority === QueuePriority.HIGH) {
      this.flush(QueuePriority.HIGH);
    }
  }

  /**
   * 从队列中获取并移除指定数量的项
   * @param priority 优先级
   * @param count 获取数量
   * @returns 队列项数组
   */
  dequeue(priority: QueuePriority, count: number = 1): QueueItem[] {
    const queue = this.queues.get(priority) || [];
    const items = queue.splice(0, count);

    if (items.length > 0) {
      // 触发移除事件
      this.emit(QueueEventType.ITEM_REMOVED, {
        priority,
        count: items.length,
      });
    }

    return items;
  }

  /**
   * 获取队列中的项，但不移除
   * @param priority 优先级
   * @param count 获取数量
   * @returns 队列项数组
   */
  peek(priority: QueuePriority, count: number = 1): QueueItem[] {
    const queue = this.queues.get(priority) || [];
    return queue.slice(0, count);
  }

  /**
   * 处理指定优先级的队列
   * @param priority 优先级，不指定则处理所有优先级
   * @returns 处理的队列项数组
   */
  flush(priority?: QueuePriority): QueueItem[] {
    let processedItems: QueueItem[] = [];

    try {
      // 如果指定了优先级，只处理该优先级队列
      if (priority) {
        const items = this.dequeue(priority, this.config.batchSize);
        processedItems = processedItems.concat(items);
      } else {
        // 按优先级从高到低处理队列
        for (const p of [QueuePriority.HIGH, QueuePriority.MEDIUM, QueuePriority.LOW]) {
          const items = this.dequeue(p, this.config.batchSize);
          processedItems = processedItems.concat(items);
          // 如果已经处理了足够多的项，就停止处理
          if (processedItems.length >= this.config.batchSize!) {
            break;
          }
        }
      }

      // 触发队列处理事件
      if (processedItems.length > 0) {
        this.emit(QueueEventType.QUEUE_FLUSHED, {
          items: processedItems,
        });
      }
    } catch (error) {
      // 触发错误事件
      this.emit(QueueEventType.ERROR, error);
    }

    return processedItems;
  }

  /**
   * 处理队列溢出
   * @param priority 发生溢出的队列优先级
   */
  private handleOverflow(priority: QueuePriority): void {
    const queue = this.queues.get(priority)!;

    if (this.config.overflowStrategy === 'discardOldest') {
      // 丢弃最旧的数据
      const discarded = queue.shift();

      // 触发溢出事件
      this.emit(QueueEventType.OVERFLOW, {
        priority,
        discarded,
        strategy: 'discardOldest',
      });
    } else {
      // 丢弃最新的数据，实际上就是拒绝添加新数据
      this.emit(QueueEventType.OVERFLOW, {
        priority,
        strategy: 'discardNewest',
      });

      throw new Error(`Queue overflow for priority ${priority}`);
    }
  }

  /**
   * 启动自动处理定时任务
   */
  private startAutoFlush(): void {
    if (this.flushTimerId !== null) {
      return;
    }

    this.flushTimerId = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 停止自动处理定时任务
   */
  stopAutoFlush(): void {
    if (this.flushTimerId !== null) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }
  }

  /**
   * 获取队列长度
   * @param priority 优先级
   * @returns 队列长度
   */
  getLength(priority?: QueuePriority): number {
    if (priority) {
      return this.queues.get(priority)?.length || 0;
    }

    // 计算所有队列的长度总和
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total;
  }

  /**
   * 清空队列
   * @param priority 优先级，不指定则清空所有队列
   */
  clear(priority?: QueuePriority): void {
    if (priority) {
      this.queues.set(priority, []);
    } else {
      this.queues.set(QueuePriority.HIGH, []);
      this.queues.set(QueuePriority.MEDIUM, []);
      this.queues.set(QueuePriority.LOW, []);
    }
  }

  /**
   * 注册事件监听器
   * @param eventType 事件类型
   * @param handler 处理函数
   */
  on(eventType: QueueEventType, handler: QueueEventHandler): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }

    this.eventListeners.get(eventType)!.push(handler);
  }

  /**
   * 取消注册事件监听器
   * @param eventType 事件类型
   * @param handler 处理函数
   */
  off(eventType: QueueEventType, handler: QueueEventHandler): void {
    if (!this.eventListeners.has(eventType)) {
      return;
    }

    const handlers = this.eventListeners.get(eventType)!;
    const index = handlers.indexOf(handler);

    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * 触发事件
   * @param eventType 事件类型
   * @param data 事件数据
   */
  private emit(eventType: QueueEventType, data?: any): void {
    const handlers = this.eventListeners.get(eventType) || [];

    for (const handler of handlers) {
      try {
        handler(eventType, data);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    }
  }

  /**
   * 销毁队列管理器
   */
  destroy(): void {
    this.stopAutoFlush();
    this.clear();
    this.eventListeners.clear();
  }
}
