import { ErrorType } from '../types';

/**
 * 初始化Promise错误监听
 * @param callback 错误回调函数
 * @returns 移除监听器的函数
 */
export function initPromiseError(callback: (errorType: ErrorType, error: PromiseRejectionEvent, metadata?: Record<string, any>) => void): () => void {
  /**
   * Promise拒绝处理函数
   */
  const rejectionHandler = (event: PromiseRejectionEvent): void => {
    // 阻止默认行为
    event.preventDefault();

    // 收集额外信息
    const metadata = {
      timestamp: Date.now(),
      url: window.location.href,
    };

    // 调用回调函数处理错误
    callback(ErrorType.PROMISE, event, metadata);
  };

  // 添加未处理的Promise拒绝监听
  window.addEventListener('unhandledrejection', rejectionHandler, true);

  // 返回移除监听器的函数
  return () => {
    window.removeEventListener('unhandledrejection', rejectionHandler, true);
  };
}
