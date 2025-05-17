import { ErrorType } from '../types';

/**
 * 初始化资源加载错误监听
 * @param callback 错误回调函数
 * @returns 移除监听器的函数
 */
export function initResourceError(callback: (errorType: ErrorType, error: ErrorEvent, metadata?: Record<string, any>) => void): () => void {
  /**
   * 资源错误处理函数
   */
  const resourceErrorHandler = (event: ErrorEvent): void => {
    // 过滤出资源加载错误
    const target = event.target || event.srcElement;
    if (!target || !(target instanceof HTMLElement)) {
      return;
    }

    // 检查是否为资源加载错误
    const isElementTarget =
      target instanceof HTMLScriptElement ||
      target instanceof HTMLLinkElement ||
      target instanceof HTMLImageElement ||
      target instanceof HTMLVideoElement ||
      target instanceof HTMLAudioElement;

    if (!isElementTarget) {
      return;
    }

    // 阻止事件冒泡
    event.preventDefault();

    // 收集资源相关信息
    const metadata: Record<string, any> = {
      timestamp: Date.now(),
      url: window.location.href,
      tagName: target.tagName.toLowerCase(),
      resourceType: getResourceType(target),
    };

    // 尝试获取资源URL
    if (target instanceof HTMLScriptElement) {
      metadata.src = target.src;
    } else if (target instanceof HTMLLinkElement) {
      metadata.href = target.href;
    } else if (target instanceof HTMLImageElement) {
      metadata.src = target.src;
    } else if (target instanceof HTMLVideoElement || target instanceof HTMLAudioElement) {
      metadata.src = target.src;
    }

    // 调用回调函数处理错误
    callback(ErrorType.RESOURCE, event, metadata);
  };

  // 添加资源错误监听
  window.addEventListener('error', resourceErrorHandler, true);

  // 返回移除监听器的函数
  return () => {
    window.removeEventListener('error', resourceErrorHandler, true);
  };
}

/**
 * 获取资源类型
 * @param target DOM元素
 * @returns 资源类型
 */
function getResourceType(target: HTMLElement): string {
  if (target instanceof HTMLScriptElement) {
    return 'script';
  } else if (target instanceof HTMLLinkElement) {
    return target.rel === 'stylesheet' ? 'css' : 'link';
  } else if (target instanceof HTMLImageElement) {
    return 'image';
  } else if (target instanceof HTMLVideoElement) {
    return 'video';
  } else if (target instanceof HTMLAudioElement) {
    return 'audio';
  }
  return 'unknown';
}
