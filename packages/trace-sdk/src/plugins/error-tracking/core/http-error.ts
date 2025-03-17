import { ExceptionMetrics, mechanismType, HttpMetrics, ErrorSeverity, ErrorCategory, ErrorEventType } from '../types/index';
import { getErrorUid, proxyXmlHttp, proxyFetch } from '../utils';

export function initHttpError(errorHandler: (data: ExceptionMetrics) => void): void {
  const loadHandler = (metrics: HttpMetrics) => {
    if (metrics?.status && metrics.status < 400) return;

    const message = `HTTP Error ${metrics?.status || 'unknown'}: ${metrics?.statusText || 'Unknown Error'}`;
    const platformMatch = /Windows|Mac|Linux|Android|iOS/.exec(navigator.userAgent);
    const platform = platformMatch ? platformMatch[0] : 'unknown';

    // 根据状态码确定严重程度
    const severity = metrics?.status && metrics.status >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH;

    const exception: ExceptionMetrics = {
      mechanism: { type: mechanismType.HTTP },
      type: 'http_error' as ErrorEventType,
      message,
      timestamp: Date.now(),
      errorUid: getErrorUid(`${mechanismType.HTTP}-${message}-${metrics.url}`),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: platform,
      severity,
      category: ErrorCategory.NETWORK,
      context: {
        environment: 'production',
        tags: {},
        severity,
        category: ErrorCategory.NETWORK,
        deviceInfo: {
          os: platform,
          browser: navigator.userAgent.split(' ')[0],
          device: /mobile|android|iphone|ipad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        },
        networkInfo: {
          effectiveType: (navigator as any).connection?.effectiveType,
          downlink: (navigator as any).connection?.downlink,
          rtt: (navigator as any).connection?.rtt,
          url: metrics.url?.toString(),
          method: metrics.method,
          status: metrics.status,
        } as any,
      },
      meta: {
        metrics,
        method: metrics.method,
        requestUrl: metrics.url?.toString() || '',
        status: metrics.status,
        statusText: metrics.statusText,
        response: metrics.response,
      },
    };

    errorHandler(exception);
  };

  proxyXmlHttp(null, loadHandler);
  proxyFetch(null, loadHandler);
}
