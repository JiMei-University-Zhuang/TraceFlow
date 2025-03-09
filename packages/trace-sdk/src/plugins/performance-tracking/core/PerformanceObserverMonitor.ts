import { Callback } from '../types';

function getResource(callback: Callback) {
  const observer = new PerformanceObserver(list => {
    list.getEntriesByType('resource').forEach(entry => {
      //数据处理
      callback(entry);
    });
  });
  observer.observe({ type: 'resource', buffered: true });
}

// 长任务监控
function getLongTasks(callback: Callback) {
  const observer = new PerformanceObserver(list => {
    list.getEntriesByType('longtask').forEach(entry => {
      // 数据处理
      callback(entry);
    });
  });
  observer.observe({ type: 'longtask', buffered: true });
}

function getFirstPaint(callback: Callback) {
  const observer = new PerformanceObserver(list => {
    list.getEntriesByType('first-paint').forEach(entry => {
      // 数据处理
      callback(entry);
    });
  });
  observer.observe({ type: 'paint', buffered: true });
}

export function initPerformanceObserver(callback: Callback) {
  getResource(callback);
  getLongTasks(callback);
  getFirstPaint(callback);
}
