import { TrackEvent } from './types';
export class QueueManager {
  immediateQueue: TrackEvent[]; //立即上报队列
  batchQueue: TrackEvent[]; //批量上报队列
  constructor() {
    this.immediateQueue = [];
    this.batchQueue = [];
  }
  //入队操作
  enqueueEvent(event: TrackEvent, isImmediate: boolean) {
    if (isImmediate || this.isCriticalEvent(event)) {
      this.immediateQueue.push(event);
    } else {
      this.batchQueue.push(event);
    }
  }
  private isCriticalEvent(event: TrackEvent): boolean {
    return ['error', 'purchase', 'checkout', 'behavior_pv'].includes(event.eventType);
  }

  //取出队列事件
  flushQueue(isImmediate: boolean, limit?: number): TrackEvent[] {
    const queue = isImmediate ? this.immediateQueue : this.batchQueue;
    if (!isImmediate) {
      const events = limit ? queue.slice(0, limit) : queue;
      this.batchQueue = queue.slice(limit);
      return events;
    }
    this.immediateQueue = [];
    return queue;
  }
}
