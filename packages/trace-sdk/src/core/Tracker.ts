import { TrackerConfig } from './types';
// import {debounce} from '../utils/index'
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

  //手动上报：创建事件->入队->上报（即时）
  public trackEvent = (eventType: string, isImmediate = false, eventData?: Record<string, any>, limit?: number) => {
    //创建事件
    const event = createBaseEvent(eventType, eventData);
    //入队
    this.queueManager.enqueueEvent(event, isImmediate);
    //上报
    this.stretageManager.sendBatch(
      this.queueManager.flushQueue(isImmediate, limit),
      this.stretageManager.selectStrategy(isImmediate, this.config.reportStrategy),
      this.config.endpoint,
    );
  };

  //自动上报
  //性能自动上报（即时+批量）
  public reportPerformance = (data: Record<string, any>) => {
    this.trackEvent('performance', data?.lcp > 2500, data);
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
      this.trackEvent('sendBatch', false, undefined, this.BATCH_LIMIT);
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

  //防抖实现的自动点击上报逻辑
  // private handleAutoClick=debounce((e: MouseEvent)=>{
  //   const target = e.target as HTMLElement;
  //      if (target?.dataset?.trackEvent) {
  //        this.trackEvent('click', {
  //          element: target.tagName,
  //          content: target.textContent?.trim(),
  //          eventName: target.dataset.trackEvent,
  //        });
  //      }
  // },200)
}
