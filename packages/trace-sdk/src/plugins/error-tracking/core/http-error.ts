import { ExceptionMetrics, mechanismType, httpMetrics } from '../types';
import { getErrorUid, proxyXmlHttp, proxyFetch } from '../utils';

export function initHttpError(errorHandler: (data: ExceptionMetrics) => void): void {
  const loadHandler = (metrics: httpMetrics) => {
    if (metrics?.status && metrics.status < 400) return;

    const message = `HTTP Error ${metrics.status}: ${metrics.statusText}`;
    const platformMatch = /Windows|Mac|Linux|Android|iOS/.exec(navigator.userAgent);
    const exception = {
      mechanism: { type: mechanismType.HTTP },
      type: 'HttpError',
      message,
      timestamp: Date.now(),
      errorUid: getErrorUid(`${mechanismType.HTTP}-${message}-${metrics.url}`),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: platformMatch ? platformMatch[0] : 'unknown',
      meta: {
        metrics,
        method: metrics.method,
        requestUrl: metrics.url.toString(),
        status: metrics.status,
        statusText: metrics.statusText,
        response: metrics.response,
      },
    } as ExceptionMetrics;

    errorHandler(exception);
  };

  proxyXmlHttp(null, loadHandler);
  proxyFetch(null, loadHandler);
}
