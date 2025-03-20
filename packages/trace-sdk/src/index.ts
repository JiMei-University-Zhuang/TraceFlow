import { errorTracking } from './plugins/error-tracking/index';
import { EventTracking } from './plugins/event-tracking/index';
import { performanceTracking } from './plugins/performance-tracking/index';
import { Tracker } from './core/Tracker';
import { utils } from './utils';

interface TraceSDKConfig {
  appId: string;
  reportUrl: string;
  errorFilter?: (error: unknown) => boolean;
  environment?: string;
  release?: string;
  tags?: Record<string, string>;
}

class TraceSDK {
  private config: TraceSDKConfig;
  private tracker: Tracker;

  constructor(config: TraceSDKConfig) {
    this.config = config;
    this.tracker = new Tracker({
      endpoint: config.reportUrl,
      autoTrack: {
        pageView: true,
        click: true,
        performance: true,
      },
    });
    this.init();
  }

  private init() {
    // 初始化工具类
    utils.init();

    // 初始化错误监控
    errorTracking.init({
      appId: this.config.appId,
      errorFilter: this.config.errorFilter,
      environment: this.config.environment,
      release: this.config.release,
      tags: this.config.tags,
      onError: error => {
        this.tracker.trackEvent('error', true, error);
      },
    });

    // 初始化事件跟踪
    EventTracking.init();

    // 初始化性能监控
    performanceTracking.init(data => {
      this.tracker.reportPerformance(data);
    });
  }

  // 初始化 Axios 拦截器
  public initAxios() {
    return performanceTracking.initAxios(data => {
      this.tracker.reportPerformance(data);
    });
  }
}

export default TraceSDK;

export { Tracker };
