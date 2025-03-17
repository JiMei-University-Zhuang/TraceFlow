import { ExceptionMetrics, mechanismType, ErrorSeverity, ErrorCategory, ErrorEventType } from '../types/index';
import { getErrorUid } from '../utils/error-utils';
import { parseStackFrames } from '../utils/stack-parser';

export function initPromiseError(errorHandler: (data: ExceptionMetrics) => void): void {
  const handler = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    const value = event.reason.message || event.reason;
    const type = event.reason.name || 'UnknownError';

    const severity = ErrorSeverity.HIGH;
    const category = ErrorCategory.RUNTIME;

    // 检测平台
    const platformMatch = /Windows|Mac|Linux|Android|iOS/.exec(navigator.userAgent);
    const platform = platformMatch ? platformMatch[0] : 'unknown';

    const exception: ExceptionMetrics = {
      mechanism: { type: mechanismType.PROMISE },
      type: 'promise_error' as ErrorEventType,
      message: value,
      stack: event.reason?.stack,
      timestamp: Date.now(),
      errorUid: getErrorUid(`${mechanismType.PROMISE}-${value}-${type}`),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform,
      severity,
      category,
      context: {
        environment: 'production',
        tags: {},
        severity,
        category,
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
        },
      },
      meta: {
        originalValue: value,
        reason: event.reason,
        stackFrames: parseStackFrames(event.reason),
      },
    };

    errorHandler(exception);
  };

  window.addEventListener('unhandledrejection', event => handler(event), true);
}
