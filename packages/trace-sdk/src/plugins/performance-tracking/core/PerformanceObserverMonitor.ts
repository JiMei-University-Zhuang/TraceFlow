import { Callback } from '../types';

function getResource(callback: Callback) {
  const observer = new PerformanceObserver(list => {
    list.getEntriesByType('resource').forEach(entry => {
      // @ts-expect-error: initiatorType在浏览器已经被打印出，过滤请求
      if (entry.initiatorType === 'xmlhttprequest') {
        return;
      }
      const data = {
        timestamp: entry.startTime,
        duration: entry.duration,
        // @ts-expect-error: initiatorType在浏览器已经被打印出，必然存在，但是ts报错
        type: entry.initiatorType,
        url: entry.name,
        // @ts-expect-error: transferSize在浏览器已经被打印出，必然存在，但是ts报错
        size: entry.transferSize,
      };
      callback({ data }); //模拟资源数据上报
    });
  });
  observer.observe({ type: 'resource', buffered: true });
}

// 长任务监控
function getLongTasks(callback: Callback) {
  const observer = new PerformanceObserver(list => {
    list.getEntriesByType('longtask').forEach(entry => {
      const data = {
        timestamp: entry.startTime,
        name: entry.name,
        duration: entry.duration,
      };
      callback({ data }); //模拟长任务数据上报
    });
  });
  observer.observe({ type: 'longtask', buffered: true });
}

export function getFirstPaint(callback: Callback) {
  const observer = new PerformanceObserver(list => {
    list.getEntriesByName('first-paint').forEach(entry => {
      const fpdata = entry.startTime;
      callback({ fpdata }); //模拟首次渲染时间上报
      //todo: 是否能与web-vitals数据合并上报
    });
  });
  observer.observe({ type: 'paint', buffered: true });
}

export function initPerformanceObserver(callback: Callback) {
  getResource(callback);
  getLongTasks(callback);
  getFirstPaint(callback);
}
