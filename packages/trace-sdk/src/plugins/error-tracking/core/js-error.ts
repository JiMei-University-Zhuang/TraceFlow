import { ExceptionMetrics, mechanismType, ErrorSeverity, ErrorCategory, ErrorEventType } from '../types/index';
import { getErrorKey, getErrorUid } from '../utils/error-utils';
import { parseStackFrames } from '../utils/stack-parser';

export function initJsError(errorHandler: (data: ExceptionMetrics) => void): void {
  const handler = (event: ErrorEvent) => {
    event.preventDefault();
    if (getErrorKey(event) !== mechanismType.JS) return;

    const severity = ErrorSeverity.HIGH;
    const category = ErrorCategory.RUNTIME;

    // 检测平台
    const platformMatch = /Windows|Mac|Linux|Android|iOS/.exec(navigator.userAgent);
    const platform = platformMatch ? platformMatch[0] : 'unknown';

    const exception: ExceptionMetrics = {
      mechanism: { type: mechanismType.JS },
      type: 'js_error' as ErrorEventType,
      message: event.message || 'Unknown JavaScript Error',
      stack: event.error?.stack,
      timestamp: Date.now(),
      errorUid: getErrorUid(`${mechanismType.JS}-${event.message}-${event.filename}`),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: platform,
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
        file: event.filename,
        col: event.colno,
        row: event.lineno,
        stackFrames: parseStackFrames(event.error),
      },
    };

    errorHandler(exception);
  };

  window.addEventListener('error', event => handler(event), true);
}
