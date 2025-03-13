import { TrackerConfig, TrackEvent, ReportStrategy } from './types';
export class Tracker {
  private config: TrackerConfig;
  private immediateQueue: TrackEvent[] = [];
  private batchQueue: TrackEvent[] = [];
  private readonly BATCH_LIMIT = 20; //上报限制
  private readonly BATCH_INTERVAL = 5000; //每五秒批量上报
  private isUnloading = false;

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

    if (this.config.autoTrack?.pageView) {
      window.addEventListener('load', this.trackPageView);
      window.addEventListener('hashchange', this.trackPageView);
    }
  }

  //自动上报点击事件逻辑
  private handleAutoClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target?.dataset?.trackEvent) {
      this.trackEvent('click', {
        element: target.tagName,
        content: target.textContent?.trim(),
        eventName: target.dataset.trackEvent,
      });
    }
  };

  //手动上报
  public trackEvent = (eventType: string, eventData?: Record<string, any>, isImmediate = false) => {
    const event = this.createBaseEvent(eventType, eventData);
    //进入队列分配流程
    this.enqueueEvent(event, isImmediate);
  };

  public trackPageView = (event?: Event) => {
    let path = window.location.pathname;

    // 处理hash变化
    if (event?.type === 'hashchange') {
      path += window.location.hash;
    }

    this.trackEvent(
      'pageView',
      {
        pagePath: path,
      },
      true,
    );
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

  private isCriticalEvent(event: TrackEvent): boolean {
    return ['error', 'purchase', 'checkout'].includes(event.eventType);
  }

  private flushImmediateQueue() {
    if (this.immediateQueue.length === 0) return;
    const events = this.immediateQueue.splice(0);
    this.sendBatch(events, this.selectStrategy(events, true));
  }

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
