import { ExceptionMetrics, mechanismType } from '../types';
import { getErrorUid } from '../utils/error-utils';
import { parseStackFrames } from '../utils/stack-parser';

export function initPromiseError(errorHandler: (data: ExceptionMetrics) => void): void {
  const handler = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    const value = event.reason.message || event.reason;
    const type = event.reason.name || 'UnKnown';

    const exception = {
      mechanism: { type: mechanismType.PROMISE },
      message: value,
      type,
      stackTrace: { frames: parseStackFrames(event.reason) },
      timestamp: Date.now(),
      errorUid: getErrorUid(`${mechanismType.PROMISE}-${value}-${type}`),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: 'browser',
      meta: {
        originalValue: value,
        reason: event.reason,
      },
    } as ExceptionMetrics;

    errorHandler(exception);
  };

  window.addEventListener('unhandledrejection', event => handler(event), true);
}
