import { PerformanceMetricType, ResourceMetrics } from '../types';

/**
 * 资源加载性能处理器类型
 */
type ResourceMetricsHandler = (metricType: PerformanceMetricType, metrics: ResourceMetrics, metadata?: Record<string, any>) => void;

/**
 * 记录过的资源URL集合
 */
const processedResources = new Set<string>();

/**
 * 初始化资源加载性能监控
 * @param handler 性能指标处理函数
 * @param samplingRate 采样率 (0-1)
 * @returns 移除监听的函数
 */
export function initResourceMetrics(handler: ResourceMetricsHandler, samplingRate = 1.0): () => void {
  /**
   * 检查是否应该采样此资源
   */
  const shouldSampleResource = (): boolean => {
    return Math.random() <= samplingRate;
  };

  /**
   * 处理资源性能条目
   */
  const processResourceEntry = (entry: PerformanceResourceTiming): void => {
    // 资源URL
    const url = entry.name;

    // 避免重复处理相同资源
    if (processedResources.has(url)) {
      return;
    }

    // 标记为已处理
    processedResources.add(url);

    // 按采样率过滤
    if (!shouldSampleResource()) {
      return;
    }

    // 提取资源加载关键时间点
    const metrics: ResourceMetrics = {
      url: entry.name,
      initiatorType: entry.initiatorType,
      size: entry.transferSize || 0,
      startTime: entry.startTime,
      responseEnd: entry.responseEnd,
      duration: entry.duration,

      // 详细时间分解
      dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
      tcpTime: entry.connectEnd - entry.connectStart,
      requestTime: entry.responseStart - entry.requestStart,
      responseTime: entry.responseEnd - entry.responseStart,
    };

    // 添加SSL时间（如果适用）
    if (entry.secureConnectionStart > 0) {
      metrics.sslTime = entry.connectEnd - entry.secureConnectionStart;
    }

    // 上报资源性能指标
    handler(PerformanceMetricType.RESOURCE, metrics, {
      pageUrl: window.location.href,
      timestamp: Date.now(),
    });
  };

  // 使用PerformanceObserver监听新的资源性能条目
  let resourceObserver: PerformanceObserver | null = null;

  if ('PerformanceObserver' in window) {
    try {
      resourceObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'resource') {
            processResourceEntry(entry as PerformanceResourceTiming);
          }
        }
      });

      // 开始观察资源性能条目
      resourceObserver.observe({ entryTypes: ['resource'] });

      // 处理已经存在的资源性能条目
      if (window.performance && window.performance.getEntriesByType) {
        const existingEntries = window.performance.getEntriesByType('resource');
        existingEntries.forEach(entry => {
          processResourceEntry(entry as PerformanceResourceTiming);
        });
      }
    } catch (e) {
      console.error('[TraceSDK][ResourceMetrics] 监听资源性能失败:', e);
    }
  } else {
    console.warn('[TraceSDK][ResourceMetrics] PerformanceObserver API不可用');
  }

  // 返回移除监听的函数
  return () => {
    if (resourceObserver) {
      resourceObserver.disconnect();
      resourceObserver = null;
    }
    // 清空处理过的资源集合
    processedResources.clear();
  };
}
