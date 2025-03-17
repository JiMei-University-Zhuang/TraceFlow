import { ExceptionMetrics, mechanismType, ResourceErrorTarget, ErrorSeverity, ErrorCategory, ErrorEventType } from '../types/index';
import { getErrorKey, getErrorUid } from '../utils/error-utils';

export function initResourceError(errorHandler: (data: ExceptionMetrics) => void): void {
  const handler = (event: Event) => {
    event.preventDefault();
    if (getErrorKey(event) !== mechanismType.RS) return;

    const target = event.target as ResourceErrorTarget;
    const platformMatch = /Windows|Mac|Linux|Android|iOS/.exec(window.navigator.userAgent);
    const platform = platformMatch ? platformMatch[0] : 'unknown';

    const severity = ErrorSeverity.HIGH;
    const category = ErrorCategory.RESOURCE;

    const exception: ExceptionMetrics = {
      type: 'resource_error' as ErrorEventType,
      message: `Failed to load resource: ${target.src}`,
      timestamp: Date.now(),
      errorUid: getErrorUid(`${mechanismType.RS}-${target.src}-${target.tagName}`),
      url: window.location.href,
      userAgent: window.navigator.userAgent,
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
      mechanism: {
        type: mechanismType.RS,
        data: {
          src: target.src,
          tagName: target.tagName,
          outerHTML: target.outerHTML,
        },
      },
      meta: {
        target: {
          src: target.src,
          tagName: target.tagName,
          outerHTML: target.outerHTML,
        },
      },
    };

    errorHandler(exception);
  };

  window.addEventListener('error', event => handler(event), true);
}
