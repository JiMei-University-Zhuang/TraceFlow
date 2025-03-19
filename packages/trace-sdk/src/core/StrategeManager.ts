import { ReportStrategy, TrackEvent } from './types';
export class StretageManager {
  selectStrategy(isImmediate: boolean, reportStrategy: ReportStrategy | undefined | 'auto'): ReportStrategy {
    if (isImmediate) {
      return this.supportBeacon() ? 'BEACON' : 'XHR';
    }
    switch (reportStrategy) {
      case 'BEACON':
        return 'BEACON';
      case 'XHR':
        return 'XHR';
      case 'IMG':
        return 'IMG';
      default:
        return 'IMG';
    }
  }

  sendBatch(events: TrackEvent[], strategy: ReportStrategy, endpoint: string) {
    try {
      switch (strategy) {
        case 'BEACON':
          this.sendWithBeacon(events, endpoint);
          break;
        case 'XHR':
          this.sendWithXHR(events, endpoint);
          break;
        case 'IMG':
          this.sendWithImage(events, endpoint);
          break;
      }
    } catch (error) {
      console.error('上报失败，重新入队', events);
    }
  }

  private sendWithBeacon(events: TrackEvent[], endpoint: string) {
    const blob = new Blob([JSON.stringify(events)], {
      type: 'application/json',
    });
    navigator.sendBeacon(endpoint, blob);
  }

  private sendWithXHR(events: TrackEvent[], endpoint: string) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(events));
  }
  private sendWithImage(events: TrackEvent[], endpoint: string) {
    const params = new URLSearchParams();
    params.set('data', btoa(JSON.stringify(events)));

    const img = new Image();
    img.src = `${endpoint}?${params}`;
    img.onload = img.onerror = () => img.remove();
  }
  private supportBeacon(): boolean {
    return typeof navigator.sendBeacon === 'function';
  }
}
