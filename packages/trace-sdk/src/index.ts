import { errorTracking } from './plugins/error-tracking/index';
import { EventTracking } from './plugins/event-tracking/index';

import { performanceTracking } from './plugins/performance-tracking/index';
import { Tracker } from './core/Tracker';
import { utils } from './utils';

interface TraceSDKConfig {
  appId: string;
  reportUrl?: string;
  batchReport?: boolean;
  batchSize?: number;
  batchTimeout?: number;
  queueSize?: number;
  errorFilter?: (error: unknown) => boolean;
}

class TraceSDK {
  private config: TraceSDKConfig;

  constructor(config: TraceSDKConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    // 初始化工具类
    utils.init();

    // 初始化错误监控
    errorTracking.init({
      appId: this.config.appId,
      reportUrl: this.config.reportUrl,
      batchReport: this.config.batchReport,
      batchSize: this.config.batchSize,
      batchTimeout: this.config.batchTimeout,
      queueSize: this.config.queueSize,
      errorFilter: this.config.errorFilter,
    });

    // 初始化事件跟踪
    EventTracking.init();

    // 初始化性能监控
    performanceTracking.init(console.log);
  }

  // 手动上报错误
  public report(error: Error | string) {
    errorTracking.report(typeof error === 'string' ? new Error(error) : error);
  }

  // 注册事件监听器
  public on(eventName: string, callback: (event: unknown) => void) {
    errorTracking.on(eventName, callback);
  }

  // 初始化 Axios 拦截器
  public initAxios() {
    return performanceTracking.initAxios();
  }
}

export default TraceSDK;

export { Tracker };
