import { HttpMetrics } from '../types';

type HttpCallback = (metrics: HttpMetrics) => void;

// 扩展 XMLHttpRequest 类型定义
declare global {
  interface XMLHttpRequest {
    _metrics: HttpMetrics;
  }
}

/**
 * 代理XMLHttpRequest请求
 * @param requestCallback 请求回调
 * @param responseCallback 响应回调
 */
export function proxyXmlHttp(requestCallback: HttpCallback | null, responseCallback: HttpCallback | null): void {
  const originXHR = window.XMLHttpRequest;
  const originOpen = originXHR.prototype.open;
  const originSend = originXHR.prototype.send;

  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
    this._metrics = {
      method,
      url: url.toString(),
      requestTime: Date.now(),
    } as HttpMetrics;
    return originOpen.call(this, method, url, async, username ?? null, password ?? null);
  };

  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    this._metrics.body = body;

    this.onreadystatechange = () => {
      if (this.readyState === 4) {
        const metrics = this._metrics;
        metrics.responseTime = Date.now();
        metrics.status = this.status;
        metrics.statusText = this.statusText;
        metrics.response = this.responseText || this.response;

        responseCallback?.call(null, metrics);
      }
    };

    return originSend.call(this, body);
  };
}

/**
 * 代理Fetch请求
 * @param requestCallback 请求回调
 * @param responseCallback 响应回调
 */
export function proxyFetch(requestCallback: HttpCallback | null, responseCallback: HttpCallback | null): void {
  const originFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const metrics: HttpMetrics = {
      method: init?.method || 'GET',
      url: typeof input === 'string' ? input : input.toString(),
      body: init?.body,
      requestTime: Date.now(),
    };

    try {
      const response = await originFetch(input, init);
      metrics.responseTime = Date.now();
      metrics.status = response.status;
      metrics.statusText = response.statusText;

      // 克隆响应以避免消费原始响应
      const clonedResponse = response.clone();
      try {
        const responseText = await clonedResponse.text();
        metrics.response = responseText;
      } catch (e) {
        metrics.response = 'Unable to read response body';
      }

      if (responseCallback) {
        responseCallback(metrics);
      }

      return response;
    } catch (error: unknown) {
      metrics.responseTime = Date.now();
      metrics.status = 0;
      metrics.statusText = error instanceof Error ? error.message : String(error);
      metrics.response = {
        error: error instanceof Error ? error.message : String(error),
      };

      if (responseCallback) {
        responseCallback(metrics);
      }

      throw error;
    }
  };
}
