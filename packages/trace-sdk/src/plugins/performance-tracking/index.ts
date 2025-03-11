import { initPerformanceObserver } from './core/PerformanceObserverMonitor';
import { initMonitorAxios } from './core/RequestMonitor';
import { initWebVitals } from './core/WebVitalsMonitor';
import { Callback, Config } from './types';

export const performanceTracking = {
  init: (callback: Callback) => {
    initPerformanceObserver(callback);
    initWebVitals(callback);
  },
  initAxios: (config?: Config) => {
    const http = initMonitorAxios(config);
    return http;
  },
};
