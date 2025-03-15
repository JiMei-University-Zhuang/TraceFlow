import { ExceptionMetrics, mechanismType } from '../types';
import { getErrorKey, getErrorUid } from '../utils/error-utils';
import { parseStackFrames } from '../utils/stack-parser';

export function initJsError(errorHandler: (data: ExceptionMetrics) => void): void {
  const handler = (event: ErrorEvent) => {
    event.preventDefault();
    if (getErrorKey(event) !== mechanismType.JS) return;

    const exception = {
      mechanism: { type: mechanismType.JS },
      type: (event.error && event.error.name) || 'UnKnown',
      message: event.message || 'Unknown JavaScript Error',
      stack: event.error?.stack,
      timestamp: Date.now(),
      errorUid: getErrorUid(`${mechanismType.JS}-${event.message}-${event.filename}`),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      meta: {
        file: event.filename,
        col: event.colno,
        row: event.lineno,
        stackFrames: parseStackFrames(event.error),
      },
    } as ExceptionMetrics;

    errorHandler(exception);
  };

  window.addEventListener('error', event => handler(event), true);
}
