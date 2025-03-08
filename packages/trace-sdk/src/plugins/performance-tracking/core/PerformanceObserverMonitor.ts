// 静态资源监控
function getResourceLoading() {
  const observer = new PerformanceObserver(list => {
    list.getEntriesByType('resource').forEach(entry => {
      // 具体逻辑
      // 1.数据处理
      // 2.上报
      // 3.监听开始停止时间
      console.log('[Resource]', entry.name, entry.duration);
    });
  });
  observer.observe({ type: 'resource', buffered: true });
}

// 长任务监控
function getLongTasks() {
  const observer = new PerformanceObserver(list => {
    list.getEntriesByType('longtask').forEach(entry => {
      // 具体逻辑
      console.log('[LongTask]', entry.duration);
    });
  });
  observer.observe({ type: 'longtask', buffered: true });
}

export function initPerformanceObserverMonitor() {
  getResourceLoading();
  getLongTasks();
}
