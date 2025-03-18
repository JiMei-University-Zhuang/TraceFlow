import { TrackerConfig, TrackEvent, ReportStrategy } from './types';

export class Tracker {
  private config: TrackerConfig;
  private immediateQueue: TrackEvent[] = []; //立即上报队列
  private batchQueue: TrackEvent[] = []; //批量上报队列
  private readonly BATCH_LIMIT = 20; //上报限制
  private readonly BATCH_INTERVAL = 5000; //每五秒批量上报
  private isUnloading = false; //页面是否卸载

  // 新增防抖定时器变量
  private clickTimer: number | null = null;

  constructor(config: TrackerConfig) {
    this.config = {
      autoTrack: {
        pageView: true,
        click: true,
        performance: true,
        ...config.autoTrack,
      },
      reportStrategy: 'auto',
      ...config,
    };
    this.initAutoTrack();
    this.initBatchFlush();
    this.initPageUnload();
  }

  //自动上报初始化
  private initAutoTrack() {
    if (this.config.autoTrack?.click) {
      document.addEventListener('click', this.handleAutoClick, true);
    }
  }

  // 增添防抖节流的按钮点击事件处理函数
  private handleAutoClick = (e: MouseEvent) => {
    // 清除之前的定时器（防抖）
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
    }

    // 设置新的定时器（延迟200ms处理）
    this.clickTimer = window.setTimeout(() => {
      const target = e.target as HTMLElement;
      if (target?.dataset?.trackEvent) {
        this.trackEvent('click', {
          element: target.tagName,
          content: target.textContent?.trim(),
          eventName: target.dataset.trackEvent,
        });
      }
      this.clickTimer = null;
    }, 200); // 200ms内连续点击只触发最后一次
  };

  //自动上报性能监控的逻辑
  public onPerformanceData = (data: Record<string, any>) => {
    this.trackEvent('performance', data, data?.lcp > 2500);
  };

  //行为上报
  public reportBehavior(type: string, data: Record<string, any>, immediate = type === 'pv') {
    const event = this.createBaseEvent(`behavior_${type}`, {
      ...data,
      _track_time: Date.now(),
      _user: this.config.userId,
    });

    // 复用现有队列逻辑
    this.enqueueEvent(event, immediate);
  }

  // ==================== 错误上报方法 ====================
  public reportError(error: Error | string, extra?: Record<string, any>) {
    const errorData = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : '',
      ...extra,
    };

    this.trackEvent('error', errorData, true); // 强制立即上报
  }

  //手动上报
  public trackEvent = (eventType: string, eventData?: Record<string, any>, isImmediate = false) => {
    const event = this.createBaseEvent(eventType, eventData);
    //进入队列分配流程
    this.enqueueEvent(event, isImmediate);
  };

  // ==================== 定时任务 ====================
  private initBatchFlush() {
    setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.flushBatchQueue();
      }
    }, this.BATCH_INTERVAL);
  }

  private initPageUnload() {
    window.addEventListener('beforeunload', () => {
      this.isUnloading = true;
      this.flushAllQueues();
    });
  }

  //队列管理,上报核心逻辑
  private enqueueEvent(event: TrackEvent, isImmediate: boolean) {
    if (isImmediate || this.isCriticalEvent(event)) {
      this.immediateQueue.push(event);
      this.flushImmediateQueue();
    } else {
      this.batchQueue.push(event);
      if (this.batchQueue.length >= this.BATCH_LIMIT) {
        this.flushBatchQueue();
      }
    }
  }

  //判断是否为关键事件
  private isCriticalEvent(event: TrackEvent): boolean {
    // 关键事件类型  错误事件、购买事件、结账事件、页面浏览事件PV
    return ['error', 'purchase', 'checkout', 'behavior_pv'].includes(event.eventType);
  }

  //立即上报并且清空立即上报队列
  private flushImmediateQueue() {
    if (this.immediateQueue.length === 0) return;
    const events = this.immediateQueue.splice(0);
    this.sendBatch(events, this.selectStrategy(events, true));
  }
  //批量上报并且清空批量上报队列
  private flushBatchQueue() {
    if (this.batchQueue.length === 0) return;
    const events = this.batchQueue.splice(0, this.BATCH_LIMIT);
    this.sendBatch(events, this.selectStrategy(events, false));
  }

  private flushAllQueues() {
    this.flushImmediateQueue();
    this.flushBatchQueue();
  }

  //选择上报策略
  private selectStrategy(events: TrackEvent[], isImmediate: boolean): ReportStrategy {
    if (this.isUnloading || isImmediate) {
      return this.supportBeacon() ? 'BEACON' : 'XHR';
    }

    switch (this.config.reportStrategy) {
      case 'BEACON':
        return 'BEACON';
      case 'XHR':
        return 'XHR';
      case 'IMG':
        return 'IMG';
      default:
        return events.length > 15 ? 'IMG' : 'XHR';
    }
  }

  private sendBatch(events: TrackEvent[], strategy: ReportStrategy) {
    try {
      switch (strategy) {
        case 'BEACON':
          this.sendWithBeacon(events);
          break;
        case 'XHR':
          this.sendWithXHR(events);
          break;
        case 'IMG':
          this.sendWithImage(events);
          break;
      }
    } catch (error) {
      console.error('上报失败，重新入队', events);
      this.reEnqueue(events);
    }
  }

  private sendWithBeacon(events: TrackEvent[]) {
    const blob = new Blob([JSON.stringify(events)], {
      type: 'application/json',
    });
    navigator.sendBeacon(this.config.endpoint, blob);
  }

  private sendWithXHR(events: TrackEvent[]) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.config.endpoint);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(events));
  }

  private sendWithImage(events: TrackEvent[]) {
    const params = new URLSearchParams();
    params.set('data', btoa(JSON.stringify(events)));

    const img = new Image();
    img.src = `${this.config.endpoint}?${params}`;
    img.onload = img.onerror = () => img.remove();
  }

  private supportBeacon(): boolean {
    return typeof navigator.sendBeacon === 'function';
  }

  //上报失败重新入队
  private reEnqueue(events: TrackEvent[]) {
    events.forEach(event => {
      if (event.attempts && event.attempts < 3) {
        event.attempts++;
        this.enqueueEvent(event, this.isCriticalEvent(event));
      }
    });
  }

  //创建一个基础的事件对象
  private createBaseEvent(eventType: string, eventData?: Record<string, any>): TrackEvent {
    return {
      eventType,
      eventData,
      timeStamp: Date.now(),
      pageUrl: window.location.href,
      userId: this.config.userId,
    };
  }
}
