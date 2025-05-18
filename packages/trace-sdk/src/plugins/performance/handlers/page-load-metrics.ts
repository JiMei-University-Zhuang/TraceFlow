import { PerformanceMetricType, PageLoadMetrics } from '../types';

/**
 * 页面加载性能处理器类型
 */
type PageLoadMetricsHandler = (metricType: PerformanceMetricType, metrics: PageLoadMetrics, metadata?: Record<string, any>) => void;

/**
 * 初始化页面加载性能监控
 * @param handler 性能指标处理函数
 * @returns 移除监听的函数
 */
export function initPageLoadMetrics(handler: PageLoadMetricsHandler): () => void {
  /**
   * 收集浏览器Performance API数据
   */
  const collectNavigationTiming = (): PageLoadMetrics | null => {
    // 确保Performance API可用
    if (!window.performance || !window.performance.timing) {
      console.warn('[TraceSDK][PageLoadMetrics] Performance API不可用');
      return null;
    }

    // 获取导航性能数据
    const timing = window.performance.timing;
    const navStart = timing.navigationStart;

    // 检查性能数据是否已经准备好
    if (timing.loadEventEnd === 0) {
      return null;
    }

    // 计算关键性能时间点，相对于navigationStart
    const metrics: PageLoadMetrics = {
      // 基准时间点
      navigationStart: 0, // 相对于自身，所以是0

      // 核心指标
      domComplete: timing.domComplete - navStart,
      domInteractive: timing.domInteractive - navStart,
      loadComplete: timing.loadEventEnd - navStart,

      // 资源统计信息
      totalDownloadSize: 0,
      resourceCount: 0,
    };

    // 收集资源信息
    if (window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      metrics.resourceCount = resources.length;

      // 计算总下载大小（如果有传输大小信息）
      metrics.totalDownloadSize = resources.reduce((total, resource: any) => {
        return total + (resource.transferSize || 0);
      }, 0);
    }

    // 收集绘制性能指标
    if (window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');

      for (const entry of paintEntries) {
        const paintEntry = entry as PerformanceEntry;
        if (paintEntry.name === 'first-paint') {
          metrics.firstPaint = paintEntry.startTime;
        } else if (paintEntry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = paintEntry.startTime;
        }
      }
    }

    // 收集Web Vitals指标
    collectWebVitals(metrics);

    return metrics;
  };

  /**
   * 收集Web Vitals性能指标
   */
  const collectWebVitals = (metrics: PageLoadMetrics): void => {
    // 监听LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        // 最大内容绘制
        const lcpObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            metrics.largestContentfulPaint = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // 首次输入延迟
        const fidObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const firstInput = entries[0];
            metrics.firstInputDelay = (firstInput as any).processingStart - firstInput.startTime;
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // 累计布局偏移
        const clsObserver = new PerformanceObserver(entryList => {
          let clsValue = 0;
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          metrics.cumulativeLayoutShift = clsValue;
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('[TraceSDK][PageLoadMetrics] 监听Web Vitals指标失败:', e);
      }
    }
  };

  // 页面加载完成后收集性能数据
  const collectMetricsOnLoad = () => {
    // 等待所有资源加载完成
    if (document.readyState === 'complete') {
      // 延迟执行，确保所有性能数据都已生成
      setTimeout(() => {
        const metrics = collectNavigationTiming();
        if (metrics) {
          handler(PerformanceMetricType.PAGE_LOAD, metrics, {
            url: window.location.href,
            documentReadyState: document.readyState,
          });
        }
      }, 300);
    }
  };

  // 如果页面已加载完成，直接收集
  if (document.readyState === 'complete') {
    collectMetricsOnLoad();
  } else {
    // 否则在load事件后收集
    window.addEventListener('load', collectMetricsOnLoad);
  }

  // 返回移除监听的函数
  return () => {
    window.removeEventListener('load', collectMetricsOnLoad);
  };
}
