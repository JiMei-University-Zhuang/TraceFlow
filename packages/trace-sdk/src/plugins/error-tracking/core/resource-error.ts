import { ExceptionMetrics, mechanismType, ResourceErrorTarget } from '../types';
import { getErrorKey, getErrorUid } from '../utils/error-utils';

export function initResourceError(errorHandler: (data: ExceptionMetrics) => void): void {
  const handler = (event: Event) => {
    event.preventDefault();
    if (getErrorKey(event) !== mechanismType.RS) return;

    const target = event.target as ResourceErrorTarget;
    const platformMatch = /Windows|Mac|Linux|Android|iOS/.exec(window.navigator.userAgent);
    const exception = {
      type: 'ResourceError',
      message: `Failed to load resource: ${target.src}`,
      timestamp: Date.now(),
      errorUid: getErrorUid(`${mechanismType.RS}-${target.src}-${target.tagName}`),
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      platform: platformMatch ? platformMatch[0] : 'unknown',
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
    } as ExceptionMetrics;

    errorHandler(exception);
  };

  window.addEventListener('error', event => handler(event), true);
}
