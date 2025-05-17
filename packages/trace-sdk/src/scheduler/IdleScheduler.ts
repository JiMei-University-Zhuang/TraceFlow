/**
 * 空闲调度配置
 */
export interface IdleSchedulerConfig {
  // 任务超时时间（毫秒），超过此时间强制执行
  timeout?: number;
  // 每个空闲期内最大执行任务数
  maxTasksPerIdle?: number;
  // 最小剩余时间（毫秒），如果空闲时间小于此值，则推迟到下一个空闲期执行
  minRemainingTime?: number;
}

/**
 * 空闲调度任务
 */
export interface IdleTask {
  // 唯一标识符
  id: string;
  // 任务执行函数
  execute: () => Promise<void> | void;
  // 优先级，数字越小优先级越高
  priority?: number;
}

/**
 * 空闲调度器
 * 使用 requestIdleCallback API 利用浏览器空闲时间执行低优先级任务
 */
export class IdleScheduler {
  // 任务队列
  private taskQueue: IdleTask[] = [];
  // 是否正在运行
  private isRunning: boolean = false;
  // 配置项
  private config: Required<IdleSchedulerConfig>;
  // 默认配置
  private static readonly DEFAULT_CONFIG: Required<IdleSchedulerConfig> = {
    timeout: 2000,
    maxTasksPerIdle: 5,
    minRemainingTime: 5,
  };

  /**
   * 构造函数
   * @param config 空闲调度配置
   */
  constructor(config: IdleSchedulerConfig = {}) {
    this.config = {
      ...IdleScheduler.DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * 添加任务
   * @param task 任务
   */
  addTask(task: IdleTask): void {
    this.taskQueue.push(task);

    // 如果调度器没有运行，启动它
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * 添加多个任务
   * @param tasks 任务数组
   */
  addTasks(tasks: IdleTask[]): void {
    this.taskQueue.push(...tasks);

    // 如果调度器没有运行，启动它
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * 移除任务
   * @param taskId 任务ID
   */
  removeTask(taskId: string): boolean {
    const initialLength = this.taskQueue.length;
    this.taskQueue = this.taskQueue.filter(task => task.id !== taskId);
    return initialLength > this.taskQueue.length;
  }

  /**
   * 开始执行任务
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.scheduleNextIdle();
  }

  /**
   * 停止执行任务
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * 清空所有任务
   */
  clear(): void {
    this.taskQueue = [];
  }

  /**
   * 获取当前队列长度
   */
  getQueueLength(): number {
    return this.taskQueue.length;
  }

  /**
   * 判断是否有特定任务
   * @param taskId 任务ID
   */
  hasTask(taskId: string): boolean {
    return this.taskQueue.some(task => task.id === taskId);
  }

  /**
   * 安排下一个空闲回调
   */
  private scheduleNextIdle(): void {
    // 如果没有任务或调度器已停止，不继续调度
    if (!this.isRunning || this.taskQueue.length === 0) {
      this.isRunning = false;
      return;
    }

    // 使用 requestIdleCallback API 进行空闲调度
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(this.handleIdle.bind(this), {
        timeout: this.config.timeout,
      });
    } else {
      // 浏览器不支持 requestIdleCallback，使用 setTimeout 降级方案
      setTimeout(() => {
        this.handleIdle({
          didTimeout: false,
          timeRemaining: () => 10,
        });
      }, 1);
    }
  }

  /**
   * 处理空闲回调
   * @param deadline 空闲期截止时间
   */
  private handleIdle(deadline: IdleDeadline): void {
    // 排序任务队列，优先级高的先执行
    this.taskQueue.sort((a, b) => (a.priority || 0) - (b.priority || 0));

    // 记录执行任务数
    let tasksExecuted = 0;

    // 当有剩余时间和任务时，继续执行
    while ((deadline.timeRemaining() > this.config.minRemainingTime || deadline.didTimeout) && this.taskQueue.length > 0 && tasksExecuted < this.config.maxTasksPerIdle) {
      // 取出第一个任务
      const task = this.taskQueue.shift();

      if (task) {
        try {
          // 执行任务
          const result = task.execute();

          // 如果返回了 Promise，可以考虑后续处理
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`Error executing idle task ${task.id}:`, error);
            });
          }
        } catch (error) {
          console.error(`Error executing idle task ${task.id}:`, error);
        }

        tasksExecuted++;
      }
    }

    // 如果还有任务，继续调度
    if (this.taskQueue.length > 0 && this.isRunning) {
      this.scheduleNextIdle();
    } else {
      this.isRunning = false;
    }
  }
}
