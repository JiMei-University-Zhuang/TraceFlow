import { TrackerConfig, TrackEvent } from '../plugins/event-tracking/types/types';
export class Tracker {
  private config: TrackerConfig;

  constructor(config: TrackerConfig) {
    this.config = {
      autoTrack: {
        pageView: true,
        click: true,
        ...config.autoTrack,
      },
      ...config,
    };

    this.initAutoTrack();
  }

  private initAutoTrack() {
    if (this.config.autoTrack?.click) {
      this.initClickTrack();
    }
  }

  //手动上报
  public trackEvent = (eventType: string, eventData?: Record<string, any>) => {
    const event = this.createBaseEvent(eventType, eventData);
    this.config.report(event);
  };

  //自动点击上报
  private initClickTrack() {
    document.addEventListener(
      'click',
      e => {
        const target = e.target as HTMLElement;
        const trackEvent = target?.dataset?.trackEvent;
        if (trackEvent) {
          this.trackEvent('click', {
            element: target.tagName,
            content: target.textContent?.trim(),
            eventName: trackEvent,
          });
        }
      },
      true,
    );
  }

  //页面浏览上报
  public trackPageView(path?: string) {
    this.trackEvent('pageView', {
      pagePath: path || window.location.pathname,
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
