import { ErrorType } from '../types';

// 扩展XMLHttpRequest类型定义，添加自定义属性
interface TraceflowXHR extends XMLHttpRequest {
  __traceflow_xhr_info?: {
    method: string;
    url: string;
    startTime: number;
    status: number;
    statusText: string;
    responseType: string;
    duration?: number;
  };
}

/**
 * 初始化HTTP错误监听
 * @param callback 错误回调函数
 * @returns 移除监听器的函数
 */
export function initHttpError(callback: (errorType: ErrorType, error: Error | Event, metadata?: Record<string, unknown>) => void): () => void {
  // 保存原始方法
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;
  const originalFetch = window.fetch;

  /**
   * 重写XMLHttpRequest.open方法
   */
  XMLHttpRequest.prototype.open = function (method: string, url: string, async: boolean = true, username?: string | null, password?: string | null): void {
    // 保存请求信息
    (this as TraceflowXHR).__traceflow_xhr_info = {
      method,
      url,
      startTime: Date.now(),
      status: 0,
      statusText: '',
      responseType: '',
    };

    // 调用原始方法
    return originalXhrOpen.call(this, method, url, async, username || null, password || null);
  };

  /**
   * 重写XMLHttpRequest.send方法
   */
  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit): void {
    // 使用箭头函数来保持this引用
    this.addEventListener('loadend', () => {
      const xhr = this as TraceflowXHR;
      const info = xhr.__traceflow_xhr_info;

      if (!info) return;

      // 更新请求信息
      info.status = this.status;
      info.statusText = this.statusText;
      info.responseType = this.responseType;
      info.duration = Date.now() - info.startTime;

      // 判断是否为错误请求（状态码 >= 400）
      if (this.status >= 400) {
        const errorObj = new Error(`HTTP Error: ${this.status} ${this.statusText}`);

        // 构造元数据
        const metadata = {
          ...info,
          response: getXhrResponse(this),
        };

        // 调用回调函数处理错误
        callback(ErrorType.HTTP, errorObj, metadata);
      }
    });

    return originalXhrSend.apply(this, [body]);
  };

  /**
   * 重写fetch方法
   */
  window.fetch = function (input: URL | RequestInfo, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    const method = init?.method || (input instanceof Request ? input.method : 'GET');
    const startTime = Date.now();

    // 调用原始fetch方法
    return originalFetch
      .call(window, input, init)
      .then(response => {
        // 判断是否为错误响应（状态码 >= 400）
        if (!response.ok) {
          const info = {
            url: urlString,
            method,
            status: response.status,
            statusText: response.statusText,
            duration: Date.now() - startTime,
          };

          const errorObj = new Error(`Fetch Error: ${response.status} ${response.statusText}`);

          // 调用回调函数处理错误
          callback(ErrorType.HTTP, errorObj, info);
        }

        return response;
      })
      .catch(error => {
        // 捕获网络错误等
        const info = {
          url: urlString,
          method,
          duration: Date.now() - startTime,
          error: error.message,
        };

        // 调用回调函数处理错误
        callback(ErrorType.HTTP, error, info);

        // 重新抛出错误，不影响原有的错误处理
        throw error;
      });
  };

  // 返回移除监听器的函数
  return () => {
    // 恢复原始方法
    XMLHttpRequest.prototype.open = originalXhrOpen;
    XMLHttpRequest.prototype.send = originalXhrSend;
    window.fetch = originalFetch;
  };
}

/**
 * 获取XHR响应内容
 * @param xhr XMLHttpRequest对象
 * @returns 响应内容（尝试解析为对象）
 */
function getXhrResponse(xhr: XMLHttpRequest): unknown {
  try {
    if (xhr.responseType === 'json') {
      return xhr.response;
    }

    const contentType = xhr.getResponseHeader('Content-Type') || '';

    if (contentType.includes('application/json') && xhr.responseText) {
      return JSON.parse(xhr.responseText);
    }

    return xhr.responseText || xhr.response;
  } catch (error) {
    return {
      parseError: (error as Error).message,
      rawResponse: String(xhr.responseText || xhr.response).slice(0, 500),
    };
  }
}
