import { initPerformanceObserver } from './core/PerformanceObserverMonitor';
import { initMonitorAxios } from './core/RequestMonitor';
import { initWebVitals } from './core/WebVitalsMonitor';
import { Config } from './types/type';
import { Tracker } from '../../core/Tracker';

export const performanceTracker = new Tracker({ endpoint: '/api/performance' });
export const performanceTracking = {
  init: () => {
    initPerformanceObserver(performanceTracker.onPerformanceData);
    initWebVitals(performanceTracker.onPerformanceData);
  },
  initAxios: (config?: Config) => {
    const http = initMonitorAxios(config);
    return http;
  },
};
