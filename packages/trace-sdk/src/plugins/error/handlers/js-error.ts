import { ErrorType } from '../types';

/**
 * 初始化JS错误监听
 * @param callback 错误回调函数
 * @returns 移除监听器的函数
 */
export function initJsError(callback: (errorType: ErrorType, error: ErrorEvent, metadata?: Record<string, any>) => void): () => void {
  /**
   * 错误事件处理函数
   */
  const errorHandler = (event: ErrorEvent): void => {
    // 阻止事件冒泡
    event.preventDefault();

    // 收集额外信息
    const metadata = {
      timestamp: Date.now(),
      url: window.location.href,
    };

    // 调用回调函数处理错误
    callback(ErrorType.JS, event, metadata);
  };

  // 添加全局错误监听
  window.addEventListener('error', errorHandler, true);

  // 返回移除监听器的函数
  return () => {
    window.removeEventListener('error', errorHandler, true);
  };
}
