import { TrackerConfig } from './types';
import { QueueManager } from './QueueManager';
import { StretageManager } from './StrategeManager';
import { createBaseEvent } from './EventManager';

export class Tracker {
  private config: TrackerConfig;
  private readonly BATCH_INTERVAL = 5000;
  private readonly BATCH_LIMIT = 20;
  private queueManager = new QueueManager();
  private stretageManager = new StretageManager();
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
    this.initBatchFlush();
    this.initPageUnload();
  }

  //手动上报：创建事件->入队->上报
  public trackEvent = (eventType: string, isImmediate = false, eventData?: Record<string, any>, limit?: number) => {
    //创建事件
    const event = createBaseEvent(eventType, eventData);
    //入队
    this.queueManager.enqueueEvent(event, isImmediate);
    //上报
    if (isImmediate) {
      this.stretageManager.sendBatch(this.queueManager.flushQueue(true, limit), this.stretageManager.selectStrategy(true, this.config.reportStrategy), this.config.endpoint);
    }
  };

  //自动上报
  //性能自动上报（即时+批量）
  public reportPerformance = (data: Record<string, any>) => {
    this.trackEvent('performance', false, data);
  };
  //行为自动上报(即时＋批量)
  public reportBehavior(type: string, data: Record<string, any>, immediate = type === 'pv') {
    this.trackEvent(`behavior_${type}`, immediate, data);
  }
  //错误自动上报（即时）
  public reportError(error: Error | string, extra?: Record<string, any>) {
    const errorData = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : '',
      ...extra,
    };
    //todo:建议数据处理不在上报逻辑中
    this.trackEvent('error', true, errorData);
  }

  //批量上报
  private initBatchFlush() {
    setInterval(() => {
      // 直接处理批量队列中的存量事件
      const events = this.queueManager.flushQueue(false, this.BATCH_LIMIT);
      if (events.length > 0) {
        this.stretageManager.sendBatch(events, this.stretageManager.selectStrategy(false, this.config.reportStrategy), this.config.endpoint);
      }
    }, this.BATCH_INTERVAL);
  }

  //优化：
  //页面卸载前上报
  private initPageUnload() {
    window.addEventListener('beforeunload', () => {
      this.trackEvent('snedAllBatch', false);
      this.trackEvent('sendAllImeediate', true);
    });
  }

  //上报失败重新入队
  // private reEnqueue(events: TrackEvent[]) {
  //   events.forEach(event => {
  //     if (event.attempts && event.attempts < 3) {
  //       event.attempts++;
  //       this.enqueueEvent(event, this.isCriticalEvent(event));
  //     }
  //   });
  // }
}
