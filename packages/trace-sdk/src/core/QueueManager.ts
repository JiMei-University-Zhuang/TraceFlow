import { TrackEvent } from './types';
export class QueueManager {
  private immediateQueue: TrackEvent[] = []; //立即上报队列
  private batchQueue: TrackEvent[] = []; //批量上报队列
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

  //返回上报参数
  flushQueue(isImmediate: boolean, limit?: number): TrackEvent[] {
    const queue = isImmediate ? this.batchQueue : this.immediateQueue;
    if (!isImmediate) {
      const events = limit ? queue.splice(0, limit) : queue;
      return events;
    }

    return queue;
  }
}
